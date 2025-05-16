import express from "express";
import ONG from "../models/Ong.js";
import LarTemporario from "../models/LarTemporario.js";
import Animal from "../models/Animal.js";
import sendEmail from "../utils/sendEmail.js";


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
    const ong = await ONG.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });

    if (ong?.email) {
    await sendEmail({
  name: ong.nome,
  email: ong.email,
  phone: ong.telefone || "-",
  message: `Olá ${ong.nome},\n\nSeu cadastro no AcolhaPatas foi aprovado!\nVocê já pode acessar a área logada com seu e-mail e senha cadastrados.`
});

    }

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
    const lar = await LarTemporario.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });

    if (lar?.email) {
    await sendEmail({
  name: lar.nome,
  email: lar.email,
  phone: lar.telefone || "-",
  message: `Olá ${lar.nome},\n\nSeu cadastro no AcolhaPatas foi aprovado!\nVocê já pode acessar a área logada com seu e-mail e senha cadastrados.`
});

    }

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
router.get("/admin/pendentes", async (req, res) => {
  try {
    const pendentesOngs = await ONG.find({ approved: false });
    const pendentesLares = await LarTemporario.find({ approved: false });
    const pendentes = [...pendentesOngs, ...pendentesLares];
    res.json(pendentes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar pendentes." });
  }
});


export default router;
