const express = require("express");
const Ong = require("../models/Ong");


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

module.exports = router;
