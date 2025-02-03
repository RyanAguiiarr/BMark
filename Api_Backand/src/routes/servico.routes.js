const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Servico = require("../models/servico");
const Arquivos = require("../models/arquivo");
const Arquivo = require("../models/arquivo");

const router = express.Router();

// Configuração do multer

//Define o armazenamento dos arquivos
const storage = multer.diskStorage({

  // Especifica o diretório onde os arquivos serão salvos. O caminho é dinâmico, baseado no salaoId enviado no corpo da requisição.
  destination: function (req, file, cb) {
    const uploadPath = `uploads/servicos/${req.body.salaoId}`;

    // verifica se o diretório já existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  // O nome do arquivo é gerado com o timestamp atual (Date.now()), garantindo nomes únicos para cada arquivo.
  filename: function (req, file, cb) {
    const fileExtension = file.originalname.split(".").pop();
    cb(null, `${Date.now()}.${fileExtension}`);
  },
});

//  Configura o Multer para usar a storage definida acima.
const upload = multer({ storage }).array("files", 5); // Aceitar até 5 arquivos

// Rota POST para Receber o Serviço e os Arquivos:
router.post("/", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Erro no upload:", err);
      return res.status(500).json({ error: true, message: err.message });
    }

    try {
      console.log("🔍 Recebido no req.body:", req.body);
      
      if (!req.body.servico) {
        console.error("Erro: Campo 'servico' não foi enviado.");
        return res.status(400).json({ error: true, message: "Campo 'servico' é obrigatório." });
      }

      let jsonServico;
      try {
        // json enviado na requisição (body)
        jsonServico = JSON.parse(req.body.servico);
        console.log("✅ JSON do serviço:", jsonServico);
      } catch (error) {
        console.error("Erro ao converter JSON:", error.message);
        return res.status(400).json({ error: true, message: "Formato inválido de serviço." });
      }

      const requiredFields = ["descricao", "recorrencia", "duracao", "comissao", "preco", "titulo", "salaoId"];
      // Se algum campo obrigatório estiver faltando, retorna um erro 400.
      for (const field of requiredFields) {
        if (!jsonServico[field]) {
          console.error(`Erro: Campo '${field}' está faltando.`);
          return res.status(400).json({ error: true, message: `Campo '${field}' é obrigatório.` });
        }
      }

      // Adiciona o salaoId ao objeto jsonServico.
      jsonServico.salaoId = req.body.salaoId;
      const servico = await new Servico(jsonServico).save();
      console.log("✅ Serviço criado com sucesso:", servico);

      // Criar Arquivos associados ao serviço
      // req.files: Contém os arquivos enviados pelo Multer. Cada arquivo é mapeado para criar um objeto de arquivo.
      const arquivos = req.files.map((file) => ({
        referenciaId: servico._id,
        model: 'Servico',
        caminho: `servicos/${req.body.salaoId}/${file.filename}`, // Caminho onde o arquivo foi salvo
      }));

      // Salvar os arquivos no MongoDB
      // Arquivos.insertMany(arquivos): Salva todos os arquivos no MongoDB, associando-os ao serviço.
      await Arquivos.insertMany(arquivos);
      console.log("✅ Arquivos associados ao serviço e salvos com sucesso.");

      res.json({ error: false, servico, arquivos }); // Retornar o serviço e arquivos criados
    } catch (err) {
      console.error("❌ Erro ao salvar serviço:", err);
      res.status(500).json({ error: true, message: err.message });
    }
  });
});

// Rota PUT para Atualizar o Serviço e adicionar Arquivos:
router.put("/:id", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Erro no upload:", err);
      return res.status(500).json({ error: true, message: err.message });
    }

    try {
      console.log("🔍 Recebido no req.body:", req.body);
      
      if (!req.body.servico) {
        console.error("Erro: Campo 'servico' não foi enviado.");
        return res.status(400).json({ error: true, message: "Campo 'servico' é obrigatório." });
      }

      let jsonServico;
      try {
        // json enviado na requisição (body)
        jsonServico = JSON.parse(req.body.servico);
        console.log("✅ JSON do serviço:", jsonServico);
      } catch (error) {
        console.error("Erro ao converter JSON:", error.message);
        return res.status(400).json({ error: true, message: "Formato inválido de serviço." });
      }

      const requiredFields = ["descricao", "recorrencia", "duracao", "comissao", "preco", "titulo", "salaoId"];
      // Se algum campo obrigatório estiver faltando, retorna um erro 400.
      for (const field of requiredFields) {
        if (!jsonServico[field]) {
          console.error(`Erro: Campo '${field}' está faltando.`);
          return res.status(400).json({ error: true, message: `Campo '${field}' é obrigatório.` });
        }
      }

      // Adiciona o salaoId ao objeto jsonServico.
      jsonServico.salaoId = req.body.salaoId;
      const servico = await Servico.findByIdAndUpdate(req.params.id, jsonServico);
      console.log("✅ Serviço atualizado com sucesso:", servico);

      // Criar Arquivos associados ao serviço
      // req.files: Contém os arquivos enviados pelo Multer. Cada arquivo é mapeado para criar um objeto de arquivo.
      const arquivos = req.files.map((file) => ({
        referenciaId: servico._id,
        model: 'Servico',
        caminho: `servicos/${req.body.salaoId}/${file.filename}`, // Caminho onde o arquivo foi salvo
      }));

      // Salvar os arquivos no MongoDB
      // Arquivos.insertMany(arquivos): Salva todos os arquivos no MongoDB, associando-os ao serviço.
      await Arquivos.insertMany(arquivos);
      console.log("✅ Arquivos associados ao serviço e salvos com sucesso.");

      res.json({ error: false, servico, arquivos }); // Retornar o serviço e arquivos criados
    } catch (err) {
      console.error("❌ Erro ao salvar serviço:", err);
      res.status(500).json({ error: true, message: err.message });
    }
  });
});

// Rota GET para Buscar os Serviços de um Salão
router.get("/salao/:salaoId", async (req, res) => {
  try {
    let servicosSalao = [];
    const servicos = await Servico.find({
       salaoId: req.params.salaoId ,
       status: {$ne: "E"}
      });

      // para cada serviço, busca os arquivos associados
      for(let servico of servicos){
        const arquivos = await Arquivos.find({ referenciaId: servico._id, model: 'Servico' });
        servicosSalao.push({...servico._doc, arquivos});
      }

      console.log(servicosSalao[0]._doc, servicosSalao[0].arquivos)
      res.json({ servicos: servicosSalao });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
})

// Rota post para Deletar o Arquivo do Serviço
router.post("/delete-arquivo", async (req, res) => {
  try {
    const {id} = req.body;

    const arquivo = await Arquivos.findById(id);

    // 2️⃣ Criar o caminho absoluto para o arquivo no servidor
    const nomeArquivo = arquivo.referenciaId.toString()
    console.log(nomeArquivo)
    const caminhoArquivo = path.join(__dirname, "..", "uploads", "servicos", nomeArquivo, arquivo.caminho);
    console.log("arquivo:", arquivo);
    console.log("🛠 Caminho completo do arquivo:", caminhoArquivo); // Debug para verificar o caminho

    // 3️⃣ Verificar se o arquivo existe antes de excluir
    if (fs.existsSync(caminhoArquivo)) {
      await fs.promises.unlink(caminhoArquivo);
      console.log("✅ Arquivo excluído com sucesso:", caminhoArquivo);
    } else {
      console.warn("⚠️ Aviso: O arquivo não foi encontrado no diretório:", caminhoArquivo);
    }

    await Arquivos.findOneAndDelete(id);

    res.json({ error: false, message: "Arquivo excluido com sucesso." });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
})

//Roata não delete fisicamente o serviço,  apenas muda o status de A para E ( excluido)
router.delete("/:id", async (req, res) => {
  try {
    const {id} = req.params;

    await Servico.findByIdAndUpdate(id, { status: "E" });

    
    res.json({ error: false, message: "serviço excluido com sucesso." });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

module.exports = router;
