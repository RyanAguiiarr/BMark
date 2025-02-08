const mongoose = require("mongoose")
const Schema = mongoose.Schema

const agendamento = new Schema({
    salaoId: {
        type: mongoose.Tipes.ObjectId,
        ref: "Salao",
        required: true
    },
    clienteId: 
        {
        type: mongoose.Tipes.ObjectId,
        ref: "Cliente",
        required: true
    },
    colaboradorid: 
    {
    type: mongoose.Tipes.ObjectId,
    ref: "Colaborador",
    required: true
    },
    servicoId: 
    {
    type: mongoose.Tipes.ObjectId,
    ref: "Servico",
    required: true
    },
    data: {
        type: Date,
        required: true
    },
    comissao: {
        type: Number,
        required: true
    },
    valor: {
        type: Number,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    }
})

const Agendamento = mongoose.model("Agendamento", agendamento)

module.exports = Agendamento