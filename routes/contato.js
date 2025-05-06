import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Animal from "../models/Animal.js";

dotenv.config();

const router = express.Router();

router.post("/contato", async (req, res) => {
  const { email, mensagem } = req.body;

  if (!email || !mensagem) {
    return res.status(400).json({ message: "Email e mensagem são obrigatórios" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Contato ONG" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_DEST,
      subject: `Mensagem da ONG: ${email}`,
      text: mensagem,
    });

    res.json({ message: "Mensagem enviada com sucesso" });
  } catch (err) {
    console.error("Erro ao enviar e-mail:", err);
    res.status(500).json({ message: "Erro ao enviar e-mail", error: err.message });
  }
});
router.post("/acolhimento", async (req, res) => {
  const { lar, animalId } = req.body;

  if (!lar || !animalId) {
    return res.status(400).json({ message: "Dados do lar e ID do animal são obrigatórios" });
  }

  try {
    const animal = await Animal.findById(animalId).populate("ong");
    console.log("Animal encontrado:", animal);
console.log("ONG populada:", animal?.ong);

    if (!animal || !animal.ong || !animal.ong.responsibleEmail) {
      
      return res.status(404).json({ message: "Animal ou ONG não encontrados ou sem e-mail" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
      <h2>🐾 Novo interesse em acolhimento!</h2>
      <h3>Animal:</h3>
      <ul>
        <li><strong>Nome:</strong> ${animal.nome}</li>
        <li><strong>Espécie:</strong> ${animal.especie}</li>
        <li><strong>Porte:</strong> ${animal.porte}</li>
        <li><strong>Idade:</strong> ${animal.idade}</li>
        <li><strong>Sexo:</strong> ${animal.sexo}</li>
      </ul>
      <h3>Lar Temporário:</h3>
      <ul>
        <li><strong>Nome:</strong> ${lar.nome}</li>
        <li><strong>Email:</strong> ${lar.email}</li>
        <li><strong>Telefone:</strong> ${lar.telefone}</li>
        <li><strong>Cidade:</strong> ${lar.cidade}</li>
        <li><strong>Estado:</strong> ${lar.estado}</li>
      </ul>
    `;

    await transporter.sendMail({
      from: `"AcolhaPatas" <${process.env.EMAIL_USER}>`,
     to: animal.ong.responsibleEmail,
      subject: `Lar interessado em acolher ${animal.nome}`,
      html: htmlContent,
    });

    res.json({ message: "E-mail enviado com sucesso para a ONG responsável!" });
  } catch (err) {
    console.error("Erro ao enviar e-mail de acolhimento:", err);
    res.status(500).json({ message: "Erro ao enviar e-mail", error: err.message });
  }
});
export default router;
