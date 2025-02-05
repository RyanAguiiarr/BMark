const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Colaborador = require("../models/colaborador");
const SalaoColaborador = require("../models/relacionamentos/salaoColaborador");
const colaboradorServico = require("../models/relacionamentos/colaboradorServico");
const mercadoPago = require("../services/mercadoPago"); // Alterado para Mercado Pago

router.post("/", async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession(); // Abrindo uma sessão no banco de dados
  session.startTransaction();

  console.log("o que estou mandando no req.body:",req.body)


  try {
    const { colaborador, salaoId } = req.body;

    // Verificar se o colaborador já existe
    const colaboradorExistente = await Colaborador.findOne({
      $or: [{ email: colaborador.email }, { telefone: colaborador.telefone }],
    });

    // Se não existir, cria um novo colaborador
    if (!colaboradorExistente) {
      // Criar um cliente no Mercado Pago (substituindo a criação de conta bancária)
      const mpCustomer = await mercadoPago.createBankAccount({
        email: colaborador.email,
        first_name: colaborador.nome,
        last_name: colaborador.sobrenome,
        phone: { area_code: "55", number: colaborador.telefone },
        identification: { type: "CPF", number: colaborador.cpf },
        address: {
          street_name: colaborador.endereco.rua,
          street_number: colaborador.endereco.numero,
          zip_code: colaborador.endereco.cep,
        },
      });


      if (mpCustomer.error) {
        console.log(mpCustomer)
        throw new Error(`Erro ao criar cliente: ${mpCustomer.message}`);
      }

      // Criar recebedor (caso seja necessário para dividir pagamentos)
      const recipient = await mercadoPago.createRecipient({
        email: colaborador.email,
        description: `Conta de recebimento para ${colaborador.nome}`,
      });

      if (recipient.error) {
        throw new Error(`Erro ao criar recebedor: ${recipient.message}`);
      }

      // Salvar no banco de dados
      const novoColaborador = new Colaborador({
        nome: colaborador.nome,
        email: colaborador.email,
        telefone: colaborador.telefone,
        cpf: colaborador.cpf,
        mercadoPagoId: mpCustomer.data.id, // ID do cliente no Mercado Pago
      });

      await novoColaborador.save({ session });

      // RELACIONAMENTO
      const colaboradorId = colaboradorExistente
      ? colaboradorExistente._id
      : novoColaborador._id;
      
      // VERIFICAR SE JA EXISTE O RELACIONAMENTO COM O SALAO
      const relacionamentoExistente = await SalaoColaborador.findOne({
        salaoId,
        colaboradorId,
        status: {$ne: "E"}
      });
      
       // SE NAO ESTIVER VINCULADIO COM O SALAO

       if(!relacionamentoExistente){
        await new SalaoColaborador({salaoId, colaboradorId}).save({session})
       }

       // SE JA EXISTIR UM VINCULO ENTRE O SALAO E O COLABORADOR
        if(relacionamentoExistente){
        await SalaoColaborador.findOneAndUpdate({
                salaoId,
                colaboradorId,
            }, {status: "A"}, {session})
        }

        // RELACIONAMENTO ENTRE COLABORADOR E SERVICO
        await colaboradorServico.insertMany(
          colaborador.servicos.map((servicoId) => ({
            servicoId,
            colaboradorId
          }), {session})
        )

      await session.commitTransaction();
      session.endSession();

      if(colaboradorExistente && relacionamentoExistente){
        return res.json({ error: true, message: "Colaborador já cadastrado!" });
      }

      return res.json({ error: false, message: "Colaborador criado com sucesso!" });
    } else {
      return res.json({ error: true, message: "Colaborador já existe!" });
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
