const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const LarTemporario = require("../models/LarTemporario");
const bcrypt = require("bcryptjs");

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
router.post("/", async (req, res) => {
  try {
    const { password, ...resto } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const novoLar = new LarTemporario({
      ...resto,
      sexo: req.body.sexo || "",
      password: hashedPassword,
    });

    await novoLar.save();
    res.status(201).json({ message: "Cadastro enviado com sucesso." });
  } catch (err) {
    res.status(500).json({ message: "Erro ao salvar cadastro.", error: err.message });
  }
});

    
// Editar perfil do lar temporário (rota protegida)
router.put("/editar", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Retira o nome para evitar atualização
    const { nome, ...dadosAtualizados } = req.body;

    // Garante que não vai salvar quantidade negativa
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


module.exports = router;

