const mongoose = require("mongoose")
const Schema = mongoose.Schema

const colaborador = new Schema({
    nome: {
      type: String,
      required: true,
    },
    telefone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    cpf: {
      type: String,
      default: null,
    },
    foto: {
      type: String,
      default: null,
    },
    dataNascimento: {
      type: String,
      required: true,
    },
    sexo: {
      type: String,
      enum: ['M', 'F'],
      required: true,
    },
    status: {
      type: String,
      enum: ['A', 'I'],
      required: true,
      default: 'A',
    },
    dataCadastro: {
      type: Date,
      default: Date.now,
    },
  });

const Colaborador = mongoose.model("Colaborador", colaborador)

module.exports = Colaborador