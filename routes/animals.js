const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const Animal = require("../models/Animal");
const { atualizarAnimal } = require('../controllers/animalController');
const sendEmail = require("../utils/sendEmail");
const Ong = require("../models/Ong");
const LarTemporario = require("../models/LarTemporario");
console.log("🔥 ESTE É O ANIMALS.JS REAL sendo executado");


const router = express.Router();

// Buscar animais com filtros
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { nome, especie, sexo, idade, porte } = req.query;
    const filtro = { ong: req.user.id };

    if (nome) filtro.nome = { $regex: nome, $options: "i" };
    if (especie) filtro.especie = especie;
    if (sexo) filtro.sexo = sexo;
    if (idade) filtro.idade = idade;
    if (porte) filtro.porte = porte;

    const animais = await Animal.find(filtro);
    res.status(200).json(animais);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar animais", error: err.message });
  }
});

// Cadastrar novo animal (com imagem obrigatória)
router.post("/", authMiddleware, upload.single("fotos"), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error("Imagem não enviada");
      return next(err);
    }

    const fotos = [req.file.path];

    const body = {
      ...req.body,
      castrado: req.body.castrado === "true" || req.body.castrado === true,
      vacinado: req.body.vacinado === "true" || req.body.vacinado === true,
      precisaLarTemporario: req.body.precisaLarTemporario === "true" || req.body.precisaLarTemporario === true,
      necessidadesEspeciais: req.body.necessidadesEspeciais === "true" || req.body.necessidadesEspeciais === true,
      usaMedicacao: req.body.usaMedicacao === "true" || req.body.usaMedicacao === true,
      deficiencia: req.body.deficiencia === "true" || req.body.deficiencia === true
    };

    const novoAnimal = new Animal({
      ...body,
      fotos,
      ong: req.user.id,
    });

  console.log("🐛 REQ.BODY:", req.body);

    await novoAnimal.save();
await novoAnimal.populate("ong");
console.log("🔥 VALOR precisaLarTemporario:", novoAnimal.precisaLarTemporario);

if (novoAnimal.precisaLarTemporario === true) {
  try {
    const lares = await LarTemporario.find({ approved: true });
    const ong = await Ong.findById(novoAnimal.ong);

    await Promise.allSettled(
      lares.map(async (lar) => {
        await sendEmail({
          name: lar.nome,
          email: lar.email,
          subject: "🐾 Novo animal precisa de lar temporário!",
          html: `
            <h2>Olá ${lar.nome}!</h2>
            <p>Uma ONG cadastrou um animal que precisa de lar temporário.</p>
            <p><strong>Animal:</strong> ${novoAnimal.nome}</p>
            <p><strong>ONG responsável:</strong> ${ong?.name || "ONG não identificada"}</p>
            <p><strong>Descrição:</strong> ${novoAnimal.descricao || "Sem descrição"}</p>
            <p><a href="https://acolhapatas.com.br/login" target="_blank">Acesse sua área</a></p>
          `
        });
      })
    );
  } catch (err) {
    console.error("❌ Erro ao tentar enviar e-mails:", err.message);
  }
}


res.status(201).json(novoAnimal);


  } catch (err) {
    next(err);
  }
});

// Atualizar animal (imagem obrigatória, mas mantém a antiga se já existir)
router.put("/:id", authMiddleware, upload.single("fotos"), async (req, res, next) => {
  console.log("📦 Body:", req.body);
  console.log("🖼️ File:", req.file);
  try {
    const animalAtual = await Animal.findById(req.params.id);

    if (!req.file && (!animalAtual || !animalAtual.fotos || animalAtual.fotos.length === 0)) {
      const err = new Error("Imagem obrigatória");
      return next(err);
    }

    const atualizacao = {
      ...req.body,
      castrado: req.body.castrado === "true" || req.body.castrado === true,
      vacinado: req.body.vacinado === "true" || req.body.vacinado === true,
      precisaLarTemporario: req.body.precisaLarTemporario === "true" || req.body.precisaLarTemporario === true,
      necessidadesEspeciais: req.body.necessidadesEspeciais === "true" || req.body.necessidadesEspeciais === true,
      usaMedicacao: req.body.usaMedicacao === "true" || req.body.usaMedicacao === true,
      deficiencia: req.body.deficiencia === "true" || req.body.deficiencia === true
    };

    if (req.file) {
      atualizacao.fotos = [req.file.path];
    }

    const animal = await Animal.findByIdAndUpdate(req.params.id, atualizacao, { new: true });
    if (!animal) return res.status(404).json({ message: "Animal não encontrado" });
    res.json(animal);
  } catch (err) {
    next(err);
  }
});

// Excluir animal
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const animal = await Animal.findByIdAndDelete(req.params.id);
    if (!animal) return res.status(404).json({ message: "Animal não encontrado" });
    res.json({ message: "Animal excluído com sucesso" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao excluir animal", error: err.message });
  }
});

module.exports = router;

