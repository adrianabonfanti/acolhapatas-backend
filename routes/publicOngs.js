const express = require("express");
const Ong = require("../models/Ong");


const router = express.Router();

// Buscar apenas ONGs aprovadas
router.get("/", async (req, res) => {
  console.log("🔍 Entrou na rota /public/ongs");
  try {
    const ongs = await Ong.find({ approved: true });
    console.log("🎯 ONGS ENCONTRADAS:", ongs.length);
    res.json(ongs);
  } catch (error) {
    console.error("❌ Erro ao buscar ONGs:", error);
    res.status(500).json({ error: "Erro ao buscar ONGs." });
  }
});


module.exports = router;
