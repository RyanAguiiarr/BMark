const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.post("/", async (req, res) => {
    const db = mongoose.connection;
    const session = await db.startSession(); // Inicia uma sessão e transação no banco para garantir que todas as operações ocorram corretamente.
    session.startTransaction();

    console.log("Dados recebidos no req.body:", req.body);

    try {
        const { colaborador, salaoId } = req.body;

        // Verifica se o colaborador já existe no banco usando o e-mail ou telefone.
        const colaboradorExistente = await Colaborador.findOne({
            $or: [{ email: colaborador.email }, { telefone: colaborador.telefone }],
        });

        let novoColaborador;

        // Se o colaborador não existir, cria um novo registro no banco de dados
        if (!colaboradorExistente) {
            novoColaborador = new Colaborador({
                nome: colaborador.nome,
                email: colaborador.email,
                telefone: colaborador.telefone,
                cpf: colaborador.cpf,
                dataNascimento: colaborador.dataNascimento,
                sexo: colaborador.sexo,
                foto: colaborador.foto,
                status: colaborador.status,
            });

            await novoColaborador.save({ session });
        }
      } catch (err) {
        await session.abortTransaction(); // Cancela as operações em caso de erro
        session.endSession();
        res.json({ error: true, message: err.message });  
      }
    })
