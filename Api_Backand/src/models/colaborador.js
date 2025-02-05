const mongoose = require("mongoose")
const Schema = mongoose.Schema

const colaborador = new Schema({
    nome: {
        type: String,
        required: true
   },
   sobrenome: {
    type: String,
    required: true
},
cpf: {
    type: String,
    required: true
},
    telefone: {
        type: String,
        required: true
   },
    email: {
        type: String,
        required: true
   },
    senha: {
        type: String,
        required: true
   },
    foto: {
        type: String,
        required: true
   },
   dataNascimento: {
        type: String, // YYYY-MM-DD
        required: true
   },
   sexo: {
    type: String, 
    enum: ["M", "F"],
    required: true
   },
   status: {
    type: String, 
    enum: ["A", "I"],
    required: true,
    default: "A"
   },
   endereco: {
    rua: {
        type: String,
        required: true
    },
    numero: {
        type: Number,
        required: true
    },
    cep: {
        type: String,
        required: true
    },
},
    recipientId: {
    type: String,
    required: true
   },
   dataCadastro: {
    type: Date,
    default: Date.now,
}
})

const Colaborador = mongoose.model("Colaborador", colaborador)

module.exports = Colaborador