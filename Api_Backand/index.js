const express = require("express")
const app = express()
const morgan = require("morgan")
require("./src/database")

// MIDDLEWARES
app.use(morgan("dev"))

// VARIAVEIS
const port = 8000

app.listen(port, () => {
    console.log(`backand escutando na porta ${port}`)
})