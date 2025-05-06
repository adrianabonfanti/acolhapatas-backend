import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

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

export default router;
