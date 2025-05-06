const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
require("dotenv").config();

router.post("/", async (req, res) => {
  const { name, phone, email, message, mensagem } = req.body;

  // Suporte para formato antigo (mensagem) e novo (message)
  const nomeFinal = name || "Visitante";
  const mensagemFinal = message || mensagem;

  if (!email || !mensagemFinal) {
    return res.status(400).json({ message: "E-mail e mensagem são obrigatórios" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${nomeFinal}" <${email}>`,
      to: process.env.EMAIL_DEST,
      subject: "Nova mensagem pelo site AcolhaPatas",
      html: `
        <h2>Mensagem recebida pelo site</h2>
        <p><strong>Nome:</strong> ${nomeFinal}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Telefone:</strong> ${phone}</p>` : ""}
        <p><strong>Mensagem:</strong><br>${mensagemFinal}</p>
      `,
    });

    res.status(200).json({ success: true, message: "Mensagem enviada com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    res.status(500).json({ success: false, message: "Erro ao enviar a mensagem." });
  }
});

module.exports = router;
