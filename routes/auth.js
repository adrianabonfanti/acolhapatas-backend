// src/routes/auth.js
import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Ong from "../models/Ong.js"; // Modelo da ONG
import LarTemporario from "../models/LarTemporario.js"; // Modelo do Lar Temporário

const router = express.Router();

// Login padrão (User)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
    if (!user.aprovado) return res.status(401).json({ message: "Cadastro não aprovado ainda" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Senha incorreta" });

    const token = jwt.sign(
      { id: user._id, tipo: user.tipo, ong: user.ong },
      process.env.JWT_SECRET
    );

    res.json({ token, tipo: user.tipo, ong: user.ong });
  } catch (err) {
    res.status(500).json({ message: "Erro ao logar", error: err.message });
  }
});

// Login para ONG
router.post("/login-ong", async (req, res) => {
  const { email, password } = req.body;

  try {
    const ong = await Ong.findOne({ responsibleEmail: email });


    if (!ong) return res.status(404).json({ message: "ONG não encontrada" });
  // VERIFICAR APROVAÇÃO
  if (!ong.approved) {
    return res.status(403).json({ message: "Cadastro ainda não aprovado." });
  }
    const isMatch = await bcrypt.compare(password, ong.password);
    if (!isMatch) return res.status(400).json({ message: "Senha incorreta" });

    const token = jwt.sign(
      { id: ong._id, tipo: "ong" },
      process.env.JWT_SECRET
    );

    res.json({ id: ong._id, token, tipo: "ong" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao logar ONG", error: err.message });
  }
});


// Login para Lar Temporário
router.post("/login-lar", async (req, res) => {
  try {
      const { email, password } = req.body;

      const lar = await LarTemporario.findOne({ email });

      if (!lar) {
          return res.status(404).json({ message: "Lar Temporário não encontrado" });
      }

      if (!lar.approved) {
          return res.status(401).json({ message: "Conta ainda não aprovada" });
      }

      const passwordMatch = await bcrypt.compare(password, lar.password);

      if (!passwordMatch) {
          return res.status(401).json({ message: "Senha incorreta" });
      }

      const token = jwt.sign(
        { id: lar._id, tipo: "lar" },
        process.env.JWT_SECRET
      );
      
      // Remove a senha do objeto antes de enviar
      const { password: senhaHash, ...larSemSenha } = lar._doc;

      
      res.status(200).json({ token, lar: larSemSenha });
      
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao logar Lar Temporário", error: err.message });
  }
});


// ➡️ Listar todos os usuários
router.get("/usuarios", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar usuários", error: err.message });
  }
});

export default router;
