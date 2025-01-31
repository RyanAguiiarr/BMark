const mongoose = require("mongoose")
const Schema = mongoose.Schema

const salaoColaborador = new Schema({
    salaoId: {
        type: mongoose.Tipes.ObjectId,
        ref: "Salao",
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

const SalaoColaborador = mongoose.model("SalaoColaborador", salaoColaborador)

module.exports = SalaoColaborador