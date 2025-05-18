import express from "express";
import Voluntario from "../models/VoluntarioEvento.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Buscar todos os voluntários de um evento
router.get("/:eventoId", async (req, res) => {
  try {
    const voluntarios = await Voluntario.find({ evento: req.params.eventoId }).sort({ createdAt: -1 });
    res.json(voluntarios);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar voluntários" });
  }
});

// Apagar um voluntário
router.delete("/:id", async (req, res) => {
  try {
    await Voluntario.findByIdAndDelete(req.params.id);
    res.json({ msg: "Voluntário removido com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao apagar voluntário" });
  }
});

export default router;
