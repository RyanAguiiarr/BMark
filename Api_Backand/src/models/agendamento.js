const mongoose = require("mongoose")
const Schema = mongoose.Schema

const agendamento = new Schema({
    salaoId: {
        type: mongoose.Types.ObjectId,
        ref: "Salao",
        required: true
    },
    clienteId: 
        {
        type: mongoose.Types.ObjectId,
        ref: "Cliente",
        required: true
    },
    colaboradorId: 
    {
    type: mongoose.Types.ObjectId,
    ref: "Colaborador",
    required: true,
    },
    servicoId: 
    {
    type: mongoose.Types.ObjectId,
    ref: "Servico",
    required: true
    },
    data: {
        type: Date,
        default: Date.now,
    },
    comissao: {
        type: Number,
    },
    valor: {
        type: Number,
        required: true
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    }
})

const Agendamento = mongoose.model("Agendamento", agendamento)

module.exports = Agendamento