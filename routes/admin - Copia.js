import express from "express";
import ONG from "../models/Ong.js";
import LarTemporario from "../models/LarTemporario.js";
import Animal from "../models/Animal.js";

const router = express.Router();

// 🏢 Buscar todas as ONGs
router.get("/ongs", async (req, res) => {
  try {
    const ongs = await ONG.find();
    res.json(ongs);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar ONGs." });
  }
});

// ✅ Aprovar ONG
router.put("/ongs/aprovar/:id", async (req, res) => {
  try {
    await ONG.findByIdAndUpdate(req.params.id, { approved: true });
    res.json({ message: "ONG aprovada com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao aprovar ONG." });
  }
});

// 🗑️ Apagar ONG
router.delete("/ongs/:id", async (req, res) => {
  try {
    await ONG.findByIdAndDelete(req.params.id);
    res.json({ message: "ONG apagada com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao apagar ONG." });
  }
});

// 🏡 Buscar todos os Lares Temporários
router.get("/lares", async (req, res) => {
  try {
    const lares = await LarTemporario.find();
    res.json(lares);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar Lares Temporários." });
  }
});

// ✅ Aprovar Lar Temporário
router.put("/lares/aprovar/:id", async (req, res) => {
  try {
    await LarTemporario.findByIdAndUpdate(req.params.id, { approved: true });
    res.json({ message: "Lar Temporário aprovado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao aprovar Lar Temporário." });
  }
});

// 🗑️ Apagar Lar Temporário
router.delete("/lares/:id", async (req, res) => {
  try {
    await LarTemporario.findByIdAndDelete(req.params.id);
    res.json({ message: "Lar Temporário apagado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao apagar Lar Temporário." });
  }
});

// 🐶 Buscar todos os Animais
router.get("/animais", async (req, res) => {
  try {
    const animais = await Animal.find();
    res.json(animais);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar Animais." });
  }
});

// 🗑️ Apagar Animal
router.delete("/animais/:id", async (req, res) => {
  try {
    await Animal.findByIdAndDelete(req.params.id);
    res.json({ message: "Animal apagado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao apagar Animal." });
  }
});

export default router;
