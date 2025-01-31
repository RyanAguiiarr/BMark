const express = require("express")
const router = express.Router()
const Salao = require("../models/salao")
const Servico = require("../models/servico")

router.post("/", async (req, res) => {
    try {
        // CRIANDO UM CONSTRUTOR DE SALAO E JA SALVANDO ELE (save())
        const salao = await new Salao(req.body).save()
        res.json({salao})
    } catch (err) {
        res.json({erro: true, message: err.message})
    }

})

router.get("/servicos/:salaoId", async (req, res) => {
    try {
        const {salaoId} = req.params

        // Usa o Mongoose para buscar no banco de dados todos os documentos da coleção Servico que atendem aos critérios:
        // Procura todos os serviços ativos (status: "A") que pertencem ao salão com ID igual a salaoId.
        // { salaoId, status: "A" }: Este é o filtro de busca
        // retorna um array com os documentos encontrados
        // .select("_id titulo"): Esta linha está especificando quais campos do documento devem ser retornados. Neste caso, estão sendo retornados apenas os campos _id e titulo.
        const servicos = await Servico.find({
            salaoId,
             status: "A"
        }).select("_id titulo")

        console.log(await Servico.find({
            salaoId,
             status: "A"
        }))
        
        /* [{ label: "serviço", value: "12231231213" }] */
        res.json({
            servicos: servicos.map(s => ({
                label: s.titulo,
                value: s._id
            }))
        })
    } catch (err) {
        res.json({erro: true, message: err.message})
    }
})

module.exports = router