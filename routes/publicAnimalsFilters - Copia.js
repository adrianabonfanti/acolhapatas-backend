import express from "express";
import Animal from "../models/Animal.js";

const router = express.Router();

// Buscar animais com filtros (público)
router.get("/", async (req, res) => {
  try {
    const query = {};

    if (req.query.nome) {
      query.nome = { $regex: req.query.nome, $options: "i" };
    }
    if (req.query.especie) {
      query.especie = { $in: Array.isArray(req.query.especie) ? req.query.especie : [req.query.especie] };
    }
    if (req.query.sexo) {
      query.sexo = { $in: Array.isArray(req.query.sexo) ? req.query.sexo : [req.query.sexo] };
    }
    if (req.query.idade) {
      query.idade = { $in: Array.isArray(req.query.idade) ? req.query.idade : [req.query.idade] };
    }
    if (req.query.porte) {
      query.porte = { $in: Array.isArray(req.query.porte) ? req.query.porte : [req.query.porte] };
    }

    const animais = await Animal.find(query);
    res.json(animais);
  } catch (error) {
    console.error("Erro ao buscar animais públicos:", error);
    res.status(500).json({ message: "Erro ao buscar animais." });
  }
});

export default router;
