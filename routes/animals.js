import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js"; // já vai estar com Cloudinary
import Animal from "../models/Animal.js";

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

// Cadastrar novo animal (usando Cloudinary)
router.post("/", authMiddleware, upload.array("fotos"), async (req, res) => {
  try {
    const fotos = req.files?.map((file) => file.path) || [];
    const novoAnimal = new Animal({
      ...req.body,
      fotos,
      ong: req.user.id,
    });
    await novoAnimal.save();
    res.status(201).json(novoAnimal);
  } catch (err) {
    res.status(500).json({ message: "Erro ao cadastrar animal", error: err.message });
  }
});


// Atualizar animal (usando Cloudinary)
router.put("/:id", authMiddleware, upload.array("fotos"), async (req, res) => {
  try {
    const atualizacao = { ...req.body };
    if (req.files && req.files.length > 0) {
      atualizacao.fotos = req.files.map((file) => file.path); // usa URL do Cloudinary
    }
    const animal = await Animal.findByIdAndUpdate(req.params.id, atualizacao, { new: true });
    if (!animal) return res.status(404).json({ message: "Animal não encontrado" });
    res.json(animal);
  } catch (err) {
    res.status(500).json({ message: "Erro ao atualizar animal", error: err.message });
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

export default router;
