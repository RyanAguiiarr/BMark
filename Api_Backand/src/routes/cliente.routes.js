const express = require("express")
const router = express.Router()
const Cliente = require("../models/cliente")
const SalaoCliente = require("../models/relacionamentos/salaoCliente")
const mongoose = require("mongoose");

router.post("/", async (req, res) => {
    const db = mongoose.connection;
    const session = await db.startSession(); // Inicia uma sessão e transação no banco para garantir que todas as operações ocorram corretamente.
    session.startTransaction();
  
    console.log("Dados recebidos no req.body:", req.body);
  
    try {
      const { cliente, salaoId } = req.body;
  
      // Verifica se o cliente já existe no banco usando o e-mail ou telefone.
      const clienteExistente = await Cliente.findOne({
        $or: [{ email: cliente.email }, { telefone: cliente.telefone }],
      });
  
      let novoCliente;
  
      // Se o cliente não existir, cria um novo registro no banco de dados
      if (!clienteExistente) {
        novoCliente = new Cliente({
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone,
          cpf: cliente.cpf,
          dataNascimento: cliente.dataNascimento,
          sexo: cliente.sexo,
          senha: cliente.senha,
          foto: cliente.foto,
          status: cliente.status,
        });
  
        await novoCliente.save({ session });
      }
  
      // Obtém o ID do cliente, seja o existente ou o recém-criado
      const clienteId = clienteExistente
        ? clienteExistente._id
        : novoCliente._id;
  
      // Verifica se já existe um relacionamento entre o salão e o cliente
      const relacionamentoExistente = await SalaoCliente.findOne({
        salaoId,
        clienteId,
        status: { $ne: "E" }, // Ignora relacionamentos excluídos
      });
  
      // Se não houver vínculo, cria um novo relacionamento
      if (!relacionamentoExistente) {
        await new SalaoCliente({ salaoId, clienteId }).save({ session });
      }
  
      // Se o cliente já estava vinculado ao salão mas inativo, ativa o vínculo
      if (relacionamentoExistente) {
        await SalaoCliente.findOneAndUpdate(
          { salaoId, clienteId },
          { status: "A" },
          { session }
        );
      }
  
      await session.commitTransaction(); // Confirma as operações no banco de dados
      session.endSession();
  
      // Retorna mensagem de sucesso ou aviso de cadastro já existente
      if (clienteExistente && relacionamentoExistente) {
        return res.json({ error: true, message: "cliente já cadastrado!" });
      }
  
      return res.json({ error: false, message: "cliente criado com sucesso!" });
    } catch (err) {
      await session.abortTransaction(); // Cancela as operações em caso de erro
      session.endSession();
      res.json({ error: true, message: err.message });
    }
  });

// Filtrar clientes
router.post("/filter", async (req, res) => {
  try {
    // Os filtros são enviados no corpo da requisição (req.body.filters).
    // Usa o find() para buscar clientes no banco de dados.
    // Retorna uma lista de clientes que correspondem aos filtros aplicados.
    const clientes = await Cliente.find(req.body.filters);
    res.json({error: false, clientes });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
})

// Listar clientes de um Salão
router.get("/salao/:salaoId", async (req, res) => {
  try {
    // Recebe o salaoId como parâmetro da URL.
    const {salaoId} = req.params

    // RECUPERAR VINCULOS
    // Busca todos os vínculos ativos (status !== "E") entre o salão e os clientes.
    // Popula os dados do cliente associado ao vínculo.
    const salaoclientes = await SalaoCliente.find({
      salaoId, 
      status: {$ne: "E"}
    }).populate("clienteId").select("clienteId dataCadastro status")

    // Retorna a lista formatada de clientes vinculados ao salão.
    res.json({
       error: false,
        clientes: salaoclientes.map((vinculo) => ({
          ...vinculo.clienteId._doc,
          vinculoId: vinculo._id,
          vinculo: vinculo.status,
          dataCadastro: vinculo.dataCadastro
        }))
      });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
})

// Excluir Vínculo de um cliente
router.delete("/vinculo/:id", async (req, res) => {
  try {
    // Não exclui o cliente do banco de dados, apenas altera o status do vínculo.
    // Evita perda de dados, pois o vínculo pode ser restaurado futuramente.
    await SalaoCliente.findByIdAndUpdate(req.params.id, { status: "E" });
    res.json({ error: false, message: "cliente excluido com sucesso!" });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
})

module.exports = router