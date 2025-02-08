const mongoose = require("mongoose")
const Schema = mongoose.Schema

const salaoCliente = new Schema({
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

const SalaoCliente = mongoose.model("SalaoCliente", salaoCliente)

module.exports = SalaoCliente