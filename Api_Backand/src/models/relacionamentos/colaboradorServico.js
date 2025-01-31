const mongoose = require("mongoose")
const Schema = mongoose.Schema

const colaboradorServico = new Schema({
    servicoId: {
        type: mongoose.Tipes.ObjectId,
        ref: "Servico",
        required: true
    },
    colaboradorId:
        {
        type: mongoose.Tipes.ObjectId,
        ref: "Colaborador",
        required: true
    },
    status: {
        type: String, 
        enum: ["A", "I"],
        required: true,
        default: "A"
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    }
})

const ColaboradorServico = mongoose.model("ColaboradorServico", colaboradorServico)

module.exports = ColaboradorServico