const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Colaborador = require("../models/colaborador");
const SalaoColaborador = require("../models/relacionamentos/salaoColaborador");
const colaboradorServico = require("../models/relacionamentos/colaboradorServico");

// Criar ou Vincular um Colaborador a um Salão
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

// Atualizar informações de um Colaborador
router.put("/:colaboradorId", async (req, res) => {
  try {
    const { vinculo, viculoId, especialidade } = req.body;
    //Recebe o colaboradorId como parâmetro na URL.
    const { colaboradorId } = req.params;

    // VINCULO
    //Atualiza o status do vínculo do colaborador com o salão, por exemplo, ativo ou inativo.
    await SalaoColaborador.findOneAndUpdate(viculoId, {status: vinculo})

    // ESPECIALIDADE
    // Remove todas as especialidades existentes associadas ao colaborador.
    await colaboradorServico.deleteMany({colaboradorId})

    // Adiciona novas especialidades ao colaborador.
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

// Excluir Vínculo de um Colaborador
router.delete("/vinculo/:id", async (req, res) => {
  try {
    // Não exclui o colaborador do banco de dados, apenas altera o status do vínculo.
    // Evita perda de dados, pois o vínculo pode ser restaurado futuramente.
    await SalaoColaborador.findByIdAndUpdate(req.params.id, { status: "E" });
    res.json({ error: false, message: "Colaborador excluido com sucesso!" });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
})

// Filtrar Colaboradores
router.post("/filter", async (req, res) => {
  try {
    // Os filtros são enviados no corpo da requisição (req.body.filters).
    // Usa o find() para buscar colaboradores no banco de dados.
    // Retorna uma lista de colaboradores que correspondem aos filtros aplicados.
    const colaboradores = await Colaborador.find(req.body.filters);
    res.json({error: false, colaboradores });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
})

// Listar Colaboradores de um Salão
router.get("/salao/:salaoId", async (req, res) => {
  try {
    // Recebe o salaoId como parâmetro da URL.
    const {salaoId} = req.params
    let listaColaboradores = []

    // RECUPERAR VINCULOS
    // Busca todos os vínculos ativos (status !== "E") entre o salão e os colaboradores.
    // Popula os dados do colaborador associado ao vínculo.
    const salaoColaboradores = await SalaoColaborador.find({
      salaoId, 
      status: {$ne: "E"}
    }).populate("colaboradorId").select("colaboradorId dataCadastro status")

    // Para cada colaborador, busca suas especialidades.
    for (let vinculo of salaoColaboradores) {
      const especialidades = await colaboradorServico.find({
        colaboradorId: vinculo.colaboradorId._id
      });
      // Monta uma resposta estruturada contendo os dados do colaborador, vínculo, status e especialidades.
      listaColaboradores.push({
        ...vinculo._doc,
        especialidades: especialidades
      });
    }

    // Retorna a lista formatada de colaboradores vinculados ao salão.
    res.json({
       error: false,
        colaboradores: listaColaboradores.map((vinculo) => ({
          ...vinculo.colaboradorId._doc,
          vinculoId: vinculo._id,
          vinculo: vinculo.status,
          especialidades: vinculo.especialidades,
          dataCadastro: vinculo.dataCadastro
        }))
      });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
})

module.exports = router;
