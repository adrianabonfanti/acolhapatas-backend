import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import LarTemporario from "../models/LarTemporario.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import upload from "../middlewares/upload.js"; // agora usa o Cloudinary
const router = express.Router();

// Buscar lares temporários disponíveis
router.get("/", async (req, res) => {
  try {
    const filtros = { approved: true, quantidade: { $gt: 0 } };

    if (req.query.nome) filtros.nome = { $regex: req.query.nome, $options: "i" };
    if (req.query.cidade) filtros.cidade = { $regex: req.query.cidade, $options: "i" };
    if (req.query.estado) filtros.estado = req.query.estado;
    if (req.query.especie) filtros.especie = req.query.especie;
    if (req.query.sexo) {
      if (req.query.sexo === "tanto-faz") {
        filtros.sexo = "tanto-faz";
      } else {
        filtros.sexo = { $in: [req.query.sexo, "tanto-faz"] };
      }
    }
    if (req.query.porte) filtros.porte = req.query.porte;
    if (req.query.idade) filtros.idade = req.query.idade;
    if (req.query.medicacao === "true") filtros.medicacao = true;
    if (req.query.tratamento === "true") filtros.tratamento = true;
    if (req.query.necessidadesEspeciais === "true") filtros.necessidadesEspeciais = true;

    const lares = await LarTemporario.find(filtros);
    res.json(lares);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar lares.", error: err.message });
  }
});

// Cadastro de lar temporário
router.post("/", upload.single("foto"), async (req, res) => {

  try {
    const fotoUrl = req.file?.path;
    const { password, ...resto } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const novoLar = new LarTemporario({
      ...resto,
      sexo: req.body.sexo || "",
      password: hashedPassword,
      foto: fotoUrl,
    });

    await novoLar.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"AcolhaPatas - Cadastro de Lar" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_DEST,
      subject: "Novo cadastro de Lar Temporário aguardando aprovação",
      html: `
        <h2>Novo cadastro de lar temporário</h2>
        <p><strong>Nome:</strong> ${resto.nome}</p>
        <p><strong>Cidade:</strong> ${resto.cidade}</p>
        <p><strong>E-mail:</strong> ${resto.email}</p>
        <p>Esse cadastro aguarda sua aprovação no painel do sistema.</p>
      `,
    });

    res.status(201).json({ message: "Cadastro enviado com sucesso." });
  } catch (err) {
    res.status(500).json({ message: "Erro ao salvar cadastro.", error: err.message });
  }
});

// Editar perfil do lar temporário (rota protegida)
router.put("/editar", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nome, ...dadosAtualizados } = req.body;

    if (dadosAtualizados.quantidade < 0) {
      return res.status(400).json({ message: "Quantidade de vagas não pode ser negativa." });
    }

    const larAtualizado = await LarTemporario.findByIdAndUpdate(
      userId,
      dadosAtualizados,
      { new: true }
    );

    res.json({ message: "Perfil atualizado com sucesso!", lar: larAtualizado });
  } catch (err) {
    res.status(500).json({ message: "Erro ao atualizar perfil do lar.", error: err.message });
  }
});

export default router;
