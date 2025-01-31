const mongoose = require("mongoose")
const Schema = mongoose.Schema

const salao = new Schema({
    nome: {
        type: String,
        required: [true, "Nome é obrigatório"]
    },
    foto: String,
    capa: String,
    email: {
        type: String,
        required: [true, "Email é obrigatório"]
    },
    senha: {
        type: String,
        default: null
    },
    telefone: String,
    endereco: {
        cidade: String,
        uf: String,
        cep: String,
        numero: String,
        pais: String,
    },
    geo: {
        tipo: String,
        cordinates: Array
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    }
})

// Isso indica que o campo geo armazena coordenadas geográficas (latitude e longitude) e permite que o MongoDB faça buscas espaciais eficientes
salao.index({geo: "2dsphere"})

const Salao = mongoose.model("Salao", salao)

module.exports = Salao