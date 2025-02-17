const express = require("express")
const router = express.Router()
const moment = require("moment");
const _ = require('lodash');
const mongoose = require("mongoose");
const Cliente = require("../models/cliente");
const Salao = require("../models/salao");
const Servico = require("../models/servico");
const Colaborador = require("../models/colaborador");
const Horario = require("../models/horario")
const Agendamento = require("../models/agendamento");
const util = require("../services/util");

router.post("/", async (req, res) => {

  const db = mongoose.connection;
        const session = await db.startSession(); // Inicia uma sessão e transação no banco para garantir que todas as operações ocorram corretamente.
        session.startTransaction();

   try {

    const { clienteId, salaoId, servicoId, colaboradorId } = req.body;

    // FASER VERIFICAÇÃO SE AINDA EXISTE AQUELE HORÁRIO DISPONÍVEL



        // RECUPERAR O CLIENTE
        const cliente = await Cliente.findById(clienteId).select("nome endereco customerId");

        // RECUPERAR O SALÃO 
        const salao = await Salao.findById(salaoId).select("nome");

        // RECUPERAR O SERVIÇO
        const servico = await Servico.findById(servicoId).select("preco titulo comissao"); 
        console.log("servico: ",servico)

        const precoFinal = util.toCents(servico.preco) * 100

        console.log(req.body);
        

  // CRIA O AGENDAMENTO
  let agendamento = req.body;
    agendamento = {
      ...agendamento,
      comissao: servico.comissao,
      valor: servico.preco,
    };
    await new Agendamento(agendamento).save();

      await session.commitTransaction(); // Confirma as operações no banco de dados
      session.endSession();
      
      res.json({ error: false, agendamento });
   } catch (err) {
    await session.abortTransaction(); // Cancela as operações em caso de erro
    session.endSession();
    res.json({ error: true, message: err.message });
  }
})

router.post("/filter", async (req, res) => {
   try {
    const {periodo, salaoId} = req.body

    const agendamentos = await Agendamento.find({
      salaoId,
      data: {
        $gte: moment(periodo.inicio).startOf("day"),
        $lte: moment(periodo.fim).endOf("day")
      }
    }).populate([
      {path: "servicoId", select: "titulo duracao"},
      {path: "colaboradorId", select: "nome"},
      {path: "clienteId", select: "nome"},
    ])

    res.json({ error: false, agendamentos })
   } catch (err) {
    res.json({ error: true, message: err.message });
  }
})

router.post('/dias-disponiveis', async (req, res) => {
  try {
    const { data, salaoId, servicoId } = req.body;
    const horarios = await Horario.find({ salaoId });
    const servico = await Servico.findById(servicoId).select('duracao');
    let colaboradores = [];

    let agenda = [];
    let lastDay = moment(data);

    // DURAÇÃO DO SERVIÇO
    const servicoDuracao = util.hourToMinutes(
      moment(servico.duracao).format('HH:mm')
    );
    const servicoDuracaoSlots = util.sliceMinutes(
      moment(servico.duracao),
      moment(servico.duracao).add(servicoDuracao, 'minutes'),
      util.SLOT_DURATION,
      false
    ).length;

    for (let i = 0; i <= 365 && agenda.length <= 7; i++) {
      const espacosValidos = horarios.filter((h) => {
        // VERIFICAR DIA DA SEMANA
        const diaSemanaDisponivel = h.dias.includes(moment(lastDay).day());

        // VERIFICAR ESPECIALIDADE DISPONÍVEL
        const servicosDisponiveis = h.especialidades.includes(servicoId);

        return diaSemanaDisponivel && servicosDisponiveis;
      });

      if (espacosValidos.length > 0) {
        // TODOS OS HORÁRIOS DISPONÍVEIS DAQUELE DIA
        let todosHorariosDia = {};
        for (let espaco of espacosValidos) {
          for (let colaborador of espaco.colaboradores) {
            if (!todosHorariosDia[colaborador._id]) {
              todosHorariosDia[colaborador._id] = [];
            }
            todosHorariosDia[colaborador._id] = [
              ...todosHorariosDia[colaborador._id],
              ...util.sliceMinutes(
                util.mergeDateTime(lastDay, espaco.inicio),
                util.mergeDateTime(lastDay, espaco.fim),
                util.SLOT_DURATION
              ),
            ];
          }
        }

        // SE TODOS OS ESPECIALISTAS DISPONÍVEIS ESTIVEREM OCUPADOS NO HORÁRIO, REMOVER
        for (let colaboradorKey of Object.keys(todosHorariosDia)) {
          // LER AGENDAMENTOS DAQUELE ESPECIALISTA NAQUELE DIA
          const agendamentos = await Agendamento.find({
            colaboradorId: colaboradorKey,
            data: {
              $gte: moment(lastDay).startOf('day'),
              $lte: moment(lastDay).endOf('day'),
            },
          }).select('data -_id');

          // RECUPERANDO HORÁRIOS OCUPADOS
          let horariosOcupado = agendamentos.map((a) => ({
            inicio: moment(a.data),
            fim: moment(a.data).add(servicoDuracao, 'minutes'),
          }));

          horariosOcupado = horariosOcupado
            .map((h) =>
              util.sliceMinutes(h.inicio, h.fim, util.SLOT_DURATION, false)
            )
            .flat();

          // REMOVENDO TODOS OS HORÁRIOS QUE ESTÃO OCUPADOS
let horariosLivres = util.splitByValue(
  _.uniq(
    todosHorariosDia[colaboradorKey].map((h) => {
      return horariosOcupado.includes(h) ? '-' : h;
    })
  ),
  '-'
);

// VERIFICANDO SE NOS HORÁRIOS CONTINUOS EXISTE SPAÇO SUFICIENTE NO SLOT
horariosLivres = horariosLivres
  .filter((h) => h.length >= servicoDuracaoSlots)
  .flat();

// Verifique se horariosLivres é um array
if (!Array.isArray(horariosLivres)) {
  horariosLivres = [];
}

/* VERIFICANDO OS HORÁRIOS DENTRO DO SLOT 
  QUE TENHAM A CONTINUIDADE NECESSÁRIA DO SERVIÇO
*/
horariosLivres = horariosLivres.map((slot) => {
  if (Array.isArray(slot)) {
    return slot.filter(
      (horario, index) => slot.length - index >= servicoDuracaoSlots
    );
  }
  return []; // Retorna um array vazio se slot não for um array
});

// SEPARANDO 2 EM 2
horariosLivres = _.chunk(horariosLivres, 2);

          // REMOVENDO O COLABORADOR DO DIA, CASO NÃO TENHA ESPAÇOS NA AGENDA
          if (horariosLivres.length === 0) {
            todosHorariosDia = _.omit(todosHorariosDia, colaboradorKey);
          } else {
            todosHorariosDia[colaboradorKey] = horariosLivres;
          }
        }

        // VERIFICANDO SE TEM ESPECIALISTA COMA AGENDA NAQUELE DIA
        const totalColaboradores = Object.keys(todosHorariosDia).length;

        if (totalColaboradores > 0) {
          colaboradores.push(Object.keys(todosHorariosDia));
          console.log(todosHorariosDia);
          agenda.push({
            [moment(lastDay).format('YYYY-MM-DD')]: todosHorariosDia,
          });
        }
      }

      lastDay = moment(lastDay).add(1, 'day');
    }

    colaboradores = await Colaborador.find({
      _id: { $in: _.uniq(colaboradores.flat()) },
    }).select('nome foto');

    colaboradores = colaboradores.map((c) => ({
      ...c._doc,
      nome: c.nome.split(' ')[0],
    }));

    res.json({ error: false, colaboradores, agenda });
  } catch (err) {
   res.json({ error: true, message: err.message });
 }
})



module.exports = router