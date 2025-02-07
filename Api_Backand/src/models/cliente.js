const mongoose = require("mongoose")
const Schema = mongoose.Schema

const cliente = new Schema({
    nome: {
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
   cpf: {
    type: String,
    required: true
},
   endereco: {
    cidade: String,
    uf: String,
    cep: String,
    numero: String,
    pais: String,
   },
   dataCadastro: {
    type: Date,
    default: Date.now,
}
})

const Cliente = mongoose.model("Cliente", cliente)

module.exports = Cliente