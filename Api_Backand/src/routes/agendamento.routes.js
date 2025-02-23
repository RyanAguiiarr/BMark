const express = require("express");
const router = express.Router();
const moment = require("moment");
const _ = require("lodash");
const mongoose = require("mongoose");
const Cliente = require("../models/cliente");
const Salao = require("../models/salao");
const Servico = require("../models/servico");
const Colaborador = require("../models/colaborador");
const Horario = require("../models/horario");
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
    const cliente = await Cliente.findById(clienteId).select(
      "nome endereco customerId"
    );

    // RECUPERAR O SALÃO
    const salao = await Salao.findById(salaoId).select("nome");

    // RECUPERAR O SERVIÇO
    const servico = await Servico.findById(servicoId).select(
      "preco titulo comissao"
    );
    console.log("servico: ", servico);

    const precoFinal = util.toCents(servico.preco) * 100;

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
});

router.post("/filter", async (req, res) => {
  try {
    const { periodo, salaoId } = req.body;

    const agendamentos = await Agendamento.find({
      salaoId,
      data: {
        $gte: moment(periodo.inicio).startOf("day"),
        $lte: moment(periodo.fim).endOf("day"),
      },
    }).populate([
      { path: "servicoId", select: "titulo duracao" },
      { path: "colaboradorId", select: "nome" },
      { path: "clienteId", select: "nome" },
    ]);

    res.json({ error: false, agendamentos });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.post("/dias-disponiveis", async (req, res) => {
  try {
    const { data, salaoId, servicoId } = req.body;

    // Buscar os horários disponíveis do salão
    const horarios = await Horario.find({ salaoId });

    // Buscar a duração do serviço
    const servico = await Servico.findById(servicoId).select("duracao");

    let colaboradores = [];
    let agenda = [];
    let lastDay = moment(data);

    // Converter duração do serviço para minutos
    const servicoDuracao = moment
      .duration(servico.duracao, "minutes")
      .asMinutes();

    // Determinar a quantidade de slots necessários para atender a duração do serviço
    const servicoDuracaoSlots = util.sliceMinutes(
      moment().startOf("day"),
      moment().startOf("day").add(servicoDuracao, "minutes"),
      util.SLOT_DURATION,
      false
    ).length;

    console.log("slots necessarios:", servicoDuracaoSlots);

    for (let i = 0; i <= 365 && agenda.length <= 7; i++) {
      // Filtrar horários disponíveis para o dia atual
      const espacosValidos = horarios.filter((h) => {
        const diaSemanaDisponivel = h.dias.includes(
          moment(lastDay).isoWeekday()
        );
        const servicosDisponiveis = h.especialidades
          .map((id) => id.toString())
          .includes(servicoId.toString());
        return diaSemanaDisponivel && servicosDisponiveis;
      });

      if (espacosValidos.length > 0) {
        let todosHorariosDia = {};

        // Organizar horários disponíveis por colaborador
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

        // Verificar agenda de cada colaborador para remover horários ocupados
        for (let colaboradorKey of Object.keys(todosHorariosDia)) {
          const agendamentos = await Agendamento.find({
            colaboradorId: colaboradorKey,
            data: {
              $gte: moment(lastDay).startOf("day"),
              $lte: moment(lastDay).endOf("day"),
            },
          }).select("data -_id");

          let horariosOcupado = _.flatten(
            agendamentos.map((a) => {
              console.log("Horário ocupado:", a);
              const inicio = moment(a.data);
              const fim = moment(a.data).add(servicoDuracao, "minutes");
              return util.sliceMinutes(inicio, fim, util.SLOT_DURATION, false);
            })
          );

          console.log("Horários ocupados:", horariosOcupado);

          // Filtrar horários livres
          let horariosLivres = todosHorariosDia[colaboradorKey].filter(
            (hLivre) => {
              const hLivreMoment = moment(hLivre);
              return !horariosOcupado.some((hOcupado) =>
                hLivreMoment.isSame(hOcupado)
              );
            }
          );

          // Verificar continuidade de horários disponíveis para atender a duração do serviço
          horariosLivres = _.chunk(horariosLivres, servicoDuracaoSlots).filter(
            (slot) => slot.length === servicoDuracaoSlots
          );

          if (horariosLivres.length === 0) {
            delete todosHorariosDia[colaboradorKey];
          } else {
            todosHorariosDia[colaboradorKey] = horariosLivres;
          }
        }

        // Se ainda houver colaboradores disponíveis no dia, adicionar ao resultado
        if (Object.keys(todosHorariosDia).length > 0) {
          colaboradores.push(...Object.keys(todosHorariosDia));
          agenda.push({
            [moment(lastDay).format("YYYY-MM-DD")]: todosHorariosDia,
          });
        }
      }
      lastDay = moment(lastDay).add(1, "day");
    }

    // Buscar informações dos colaboradores disponíveis
    colaboradores = await Colaborador.find({
      _id: { $in: _.uniq(colaboradores) },
    }).select("nome foto");

    // Formatar nomes para exibir apenas o primeiro nome
    colaboradores = colaboradores.map((c) => ({
      ...c._doc,
      nome: c.nome.split(" ")[0],
    }));

    res.json({ error: false, colaboradores, agenda });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
