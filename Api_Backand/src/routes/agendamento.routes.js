const express = require("express")
const router = express.Router()
const moment = require("moment");
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

router.post("/dias-disponiveis", async (req, res) => {
  try {
   const {data, salaoId, servicoId} = req.body
   const horarios = await Horario.find({salaoId})
   const servico = await Servico.findById(servicoId).select("duracao")

   let agenda = []
   let ultimoDia = moment(data)

   // DURAÇÃO DO SERVIÇO
   const servicoMinutos = util.hourToMinutes(moment(servico.duracao).format("HH:mm"))

   console.log("minutos:", servicoMinutos)
   res.json({ error: false, servicoMinutos })
  } catch (err) {
   res.json({ error: true, message: err.message });
 }
})


module.exports = router