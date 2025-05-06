import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/pendentes", async (req, res) => {
  try {
    const pendentes = await User.find({ aprovado: false });
    res.json(pendentes);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar pendentes", error: err });
  }
});

router.post("/aprovar/:id", async (req, res) => {
  try {
    const usuario = await User.findByIdAndUpdate(req.params.id, { aprovado: true }, { new: true });
    if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });
    res.json({ message: "Usuário aprovado com sucesso", usuario });
  } catch (err) {
    res.status(500).json({ message: "Erro ao aprovar", error: err });
  }
});

router.delete("/recusar/:id", async (req, res) => {
  try {
    const usuario = await User.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });
    res.json({ message: "Usuário recusado e excluído" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao recusar", error: err });
  }
});

export default router;
