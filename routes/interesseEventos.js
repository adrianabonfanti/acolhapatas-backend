import express from "express";
import InteresseEvento from "../models/InteresseEvento.js";

const router = express.Router();

router.post("/interesse-eventos", async (req, res) => {
  try {
    const { nome, email, cidade, estado } = req.body;

    const novo = new InteresseEvento({
      nome,
      email,
     cidade: cidade?.trim() || "",
      estado: estado?.trim() || ""
    });

    await novo.save();
    res.status(201).json({ message: "Interesse cadastrado com sucesso" });
  } catch (err) {
    console.error("Erro ao salvar interesse:", err);
    res.status(500).json({ error: "Erro ao salvar interesse" });
  }
});

export default router;
