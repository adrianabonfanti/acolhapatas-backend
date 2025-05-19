import express from "express";
import Voluntario from "../models/VoluntarioEvento.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rota pública – cadastro de voluntário
router.post("/", async (req, res) => {
  try {
    const { nome, telefone, evento } = req.body;
    if (!evento) return res.status(400).json({ erro: "Evento obrigatório" });

    const novo = new Voluntario({ nome, telefone, evento });
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao cadastrar voluntário" });
  }
});

// Rotas privadas – exigem token
router.use(authMiddleware);

router.get("/:eventoId", async (req, res) => {
  const lista = await Voluntario.find({ evento: req.params.eventoId });
  res.json(lista);
});

router.delete("/:id", async (req, res) => {
  await Voluntario.findByIdAndDelete(req.params.id);
  res.json({ msg: "Voluntário removido" });
});

export default router;
