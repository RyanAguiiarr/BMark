const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Colaborador = require("../models/colaborador");
const SalaoColaborador = require("../models/relacionamentos/salaoColaborador");
const colaboradorServico = require("../models/relacionamentos/colaboradorServico");

router.post("/", async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession(); // Inicia uma sessão no banco de dados
  session.startTransaction();

  console.log("Dados recebidos no req.body:", req.body);

  try {
    const { colaborador, salaoId } = req.body;

    // Verifica se o colaborador já existe no banco de dados
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

    // Obtém o ID do colaborador, seja o existente ou o recém-criado
    const colaboradorId = colaboradorExistente
      ? colaboradorExistente._id
      : novoColaborador._id;

    // Verifica se já existe um relacionamento entre o salão e o colaborador
    const relacionamentoExistente = await SalaoColaborador.findOne({
      salaoId,
      colaboradorId,
      status: { $ne: "E" }, // Ignora relacionamentos excluídos
    });

    // Se não houver vínculo, cria um novo relacionamento
    if (!relacionamentoExistente) {
      await new SalaoColaborador({ salaoId, colaboradorId }).save({ session });
    }

    // Se o colaborador já estava vinculado ao salão mas inativo, ativa o vínculo
    if (relacionamentoExistente) {
      await SalaoColaborador.findOneAndUpdate(
        { salaoId, colaboradorId },
        { status: "A" },
        { session }
      );
    }

    // Relacionamento entre colaborador e serviços prestados
    await colaboradorServico.insertMany(
      colaborador.servicos.map((servicoId) => ({
        servicoId,
        colaboradorId,
      })),
      { session }
    );

    await session.commitTransaction(); // Confirma as operações no banco de dados
    session.endSession();

    // Retorna mensagem de sucesso ou aviso de cadastro já existente
    if (colaboradorExistente && relacionamentoExistente) {
      return res.json({ error: true, message: "Colaborador já cadastrado!" });
    }

    return res.json({ error: false, message: "Colaborador criado com sucesso!" });
  } catch (err) {
    await session.abortTransaction(); // Cancela as operações em caso de erro
    session.endSession();
    res.json({ error: true, message: err.message });
  }
});

router.put("/:colaboradorId", async (req, res) => {
  try {
    const { vinculo, viculoId, especialidade } = req.body;
    const { colaboradorId } = req.params;

    // VINCULO
    await SalaoColaborador.findOneAndUpdate(viculoId, {status: vinculo})

    // ESPECIALIDADE
    // DELETA TODAS AS ESPECIALIDADES
    await colaboradorServico.deleteMany({colaboradorId})

    // ADICIONA NOVAS ESPECIALIDADES
    await colaboradorServico.insertMany(
      especialidade.map((servicoId) => ({
        servicoId,
        colaboradorId,
      }))
    )

    res.json({ error: false, message: "Colaborador atualizado com sucesso!" });
    
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
})

module.exports = router;
