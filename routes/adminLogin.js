import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// Admin fixo
const ADMIN_EMAIL = "adrianahbonfanti@gmail.com";
const ADMIN_PASSWORD = "123456";

const SECRET_KEY = "acolhapatasSuperSecreta"; // Depois podemos melhorar com .env

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: "2h" });
    res.json({ token });
  } else {
    res.status(401).json({ message: "E-mail ou senha inválidos" });
  }
});

export default router;
