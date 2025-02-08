const express = require("express")
const router = express.Router()
const mongoose = require("mongoose");

router.post("/", async (req, res) => {
    const db = mongoose.connection;
    const session = await db.startSession(); // Inicia uma sessão e transação no banco para garantir que todas as operações ocorram corretamente.
    session.startTransaction();
  
    console.log("Dados recebidos no req.body:", req.body);
  
    try {
      const { colaborador, salaoId } = req.body;
  
<<<<<<< HEAD
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
=======
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
>>>>>>> parent of e564eee (terminando rotas clientes)
        salaoId,
        colaboradorId,
        status: { $ne: "E" }, // Ignora relacionamentos excluídos
      });
  
      // Se não houver vínculo, cria um novo relacionamento
      if (!relacionamentoExistente) {
<<<<<<< HEAD
        await new Salaocliente({ salaoId, clienteId }).save({ session });
=======
        await new SalaoColaborador({ salaoId, colaboradorId }).save({ session });
>>>>>>> parent of e564eee (terminando rotas clientes)
      }
  
      // Se o colaborador já estava vinculado ao salão mas inativo, ativa o vínculo
      if (relacionamentoExistente) {
<<<<<<< HEAD
        await Salaocliente.findOneAndUpdate(
          { salaoId, clienteId },
=======
        await SalaoColaborador.findOneAndUpdate(
          { salaoId, colaboradorId },
>>>>>>> parent of e564eee (terminando rotas clientes)
          { status: "A" },
          { session }
        );
      }
  
<<<<<<< HEAD
      // Relacionamento entre cliente e serviços prestados
      await clienteServico.insertMany(
        cliente.servicos.map((servicoId) => ({
          servicoId,
          clienteId,
=======
      // Relacionamento entre colaborador e serviços prestados
      await colaboradorServico.insertMany(
        colaborador.servicos.map((servicoId) => ({
          servicoId,
          colaboradorId,
>>>>>>> parent of e564eee (terminando rotas clientes)
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

module.exports = router