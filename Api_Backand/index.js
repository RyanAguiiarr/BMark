const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")
require("./src/database")


// MIDDLEWARES
app.use(morgan("dev"))
app.use(express.json())
app.use(cors())

// VARIAVEIS
const port = 8000

// ROTAS
app.use("/salao", require("./src/routes/salao.routes"))

app.listen(port, () => {
    console.log(`backand escutando na porta ${port}`)
})