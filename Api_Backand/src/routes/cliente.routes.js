const express = require("express")
const router = express.Router()
const mongoose = require("mongoose");

router.post("/", async (req, res) => {
    const db = mongoose.connection;
    const session = await db.startSession(); // Inicia uma sessão e transação no banco para garantir que todas as operações ocorram corretamente.
    session.startTransaction();
  
    console.log("Dados recebidos no req.body:", req.body);
  
    try {
      const { cliente, salaoId } = req.body;
  
      // Verifica se o cliente já existe no banco usando o e-mail ou telefone.
      const clienteExistente = await cliente.findOne({
        $or: [{ email: cliente.email }, { telefone: cliente.telefone }],
      });
  
      let novocliente;
  
      // Se o cliente não existir, cria um novo registro no banco de dados
      if (!clienteExistente) {
        novocliente = new cliente({
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone,
          cpf: cliente.cpf,
          dataNascimento: cliente.dataNascimento,
          sexo: cliente.sexo,
          foto: cliente.foto,
          status: cliente.status,
        });
  
        await novocliente.save({ session });
      }
  
      // Obtém o ID do cliente, seja o existente ou o recém-criado
      const clienteId = clienteExistente
        ? clienteExistente._id
        : novocliente._id;
  
      // Verifica se já existe um relacionamento entre o salão e o cliente
      const relacionamentoExistente = await Salaocliente.findOne({
        salaoId,
        clienteId,
        status: { $ne: "E" }, // Ignora relacionamentos excluídos
      });
  
      // Se não houver vínculo, cria um novo relacionamento
      if (!relacionamentoExistente) {
        await new Salaocliente({ salaoId, clienteId }).save({ session });
      }
  
      // Se o cliente já estava vinculado ao salão mas inativo, ativa o vínculo
      if (relacionamentoExistente) {
        await Salaocliente.findOneAndUpdate(
          { salaoId, clienteId },
          { status: "A" },
          { session }
        );
      }
  
      // Relacionamento entre cliente e serviços prestados
      await clienteServico.insertMany(
        cliente.servicos.map((servicoId) => ({
          servicoId,
          clienteId,
        })),
        { session }
      );
  
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

module.exports = router