// ARQUIVO DE CONFIGURAÇÃO DO BANCO DE DADOS
// ARQUIVO DE CONEXÃO AO BANCO DE DADOS (MONGODB)

const mongoose = require("mongoose")
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const URI = process.env.URI

mongoose.connect(URI).then(() => {
    console.log("conectado ao MongoBD")
}).catch((err) => {
    console.log("banco de dados nao conectado", err)
})
