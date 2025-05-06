import express from "express";
import Animal from "../models/Animal.js";

const router = express.Router();

// Pegar animais aleatórios para a Home
router.get("/random/:qtd", async (req, res) => {
  try {
    const quantidade = parseInt(req.params.qtd) || 6;
    const animais = await Animal.aggregate([{ $sample: { size: quantidade } }]);
    res.json(animais);
  } catch (error) {
    console.error("Erro ao buscar animais aleatórios:", error);
    res.status(500).json({ message: "Erro ao buscar animais aleatórios." });
  }
});

export default router;
