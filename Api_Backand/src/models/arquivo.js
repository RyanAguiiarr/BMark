const mongoose = require("mongoose")
const Schema = mongoose.Schema

const arquivo = new Schema({
    // refPath: "model" significa que este ID pode referenciar diferentes coleções (Salao ou Servico), dependendo do valor de model.
    referenciaId: {
        type: Schema.Types.ObjectId,
        refPath: "model",
    },
    model: {
        type: String,
        required: true,
        enum: ["Salao", "Servico"]
    },
    caminho: {
        type: String,
        required: true
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    }
})

const Arquivo = mongoose.model("Arquivo", arquivo)

module.exports = Arquivo