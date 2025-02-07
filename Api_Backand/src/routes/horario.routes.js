const express = require("express")
const router = express.Router()
const _ = require("lodash")
const Horario = require("../models/horario");
const colaboradorServico = require("../models/relacionamentos/colaboradorServico");

// Criar um Horário
router.post("/", async (req, res) => {
    try {
        const horario = await new Horario(req.body).save()
        res.json({horario})
    } catch (err) {
        res.json({erro: true, message: err.message})
    }
})

// Retorna todos os horários de um determinado salão.
router.get("/salao/:salaoId", async (req, res) => {
    try {
        const {salaoId} = req.params

        const horarios = await Horario.find({salaoId})

        res.json({horarios})
    } catch (err) {
        res.json({erro: true, message: err.message})
    }
})

// Atualiza um horário existente com os novos dados enviados no corpo da requisição.
router.put("/:horarioId", async (req, res) => {
    try {
        const {horarioId} = req.params
        const horario = req.body

        await Horario.findByIdAndUpdate(horarioId, horario)

        res.json({error: false, message: "Horário atualizado com sucesso!"})
    } catch (err) {
        res.json({erro: true, message: err.message})
    }
})

// Remove um horário do banco de dados pelo ID.
router.delete("/:horarioId", async (req, res) => {
    try {
        const {horarioId} = req.params
        
        await Horario.findByIdAndDelete(horarioId)

        res.json({error: false, message: "Horário deletado com sucesso!"})
    } catch (err) {
        res.json({erro: true, message: err.message})
    }
})

// Retorna uma lista de colaboradores que possuem as especialidades especificadas no corpo da requisição.
router.post("/colaboradores", async (req, res) => {
    try {
       const ColaboradorServico = await colaboradorServico.find({
        servicoId: {$in: req.body.especialidades},
        status: "A"
       }).populate("colaboradorId", "nome").select("colaboradorId -_id")

       const listaColaboradores =
       _.uniqBy(ColaboradorServico, (vinculo) => vinculo.colaboradorId._id.toString()).map((vinculo) => ({
        label: vinculo.colaboradorId._id,
        value: vinculo.colaboradorId.nome
       }))

       res.json({error: false, listaColaboradores})
    } catch (err) {
        res.json({erro: true, message: err.message})
    }
})

module.exports = router