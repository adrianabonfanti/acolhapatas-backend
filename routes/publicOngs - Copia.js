import express from "express";
import Ong from "../models/Ong.js";

const router = express.Router();

// Buscar apenas ONGs aprovadas
router.get("/", async (req, res) => {
  try {
    const ongs = await Ong.find({ approved: true }); // Só ONGs aprovadas!
    res.json(ongs);
  } catch (error) {
    console.error("Erro ao buscar ONGs:", error);
    res.status(500).json({ error: "Erro ao buscar ONGs." });
  }
});

export default router;