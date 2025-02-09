const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")

require("./src/database")


// MIDDLEWARES
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true })); 
app.use(cors())

// VARIAVEIS
const port = 8000

// ROTAS
app.use("/salao", require("./src/routes/salao.routes"))
app.use("/servico", require("./src/routes/servico.routes"))
app.use("/horario", require("./src/routes/horario.routes"))
app.use("/colaborador", require("./src/routes/colaborador.routes"))
app.use("/cliente", require("./src/routes/cliente.routes"))
app.use("/agendamento", require("./src/routes/agendamento.routes"))

app.listen(port, () => {
    console.log(`back-end escutando na porta ${port}`)
})