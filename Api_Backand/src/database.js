// ARQUIVO DE CONFIGURAÇÃO DO BANCO DE DADOS
// ARQUIVO DE CONEXÃO AO BANCO DE DADOS (MONGODB)

const mongoose = require("mongoose")
const URI = "mongodb+srv://Ryan:cucamole@bmark.kxkmu.mongodb.net/?retryWrites=true&w=majority&appName=BMark"

mongoose.connect(URI).then(() => {
    console.log("conectado ao MongoBD")
}).catch(() => {
    console.log("banco de dados nao conectado", err)
})
