import express from "express";
import LarTemporario from "../models/LarTemporario.js";
import bcrypt from "bcryptjs"; // adicionar no topo também
const router = express.Router();
// Buscar lares temporários disponíveis
router.get("/", async (req, res) => {
  try {
    const filtros = { approved: true, quantidade: { $gt: 0 } };

    if (req.query.nome) filtros.nome = { $regex: req.query.nome, $options: "i" };
    if (req.query.cidade) filtros.cidade = { $regex: req.query.cidade, $options: "i" };
    if (req.query.estado) filtros.estado = req.query.estado;
    if (req.query.especie) filtros.especie = req.query.especie;
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
          password: hashedPassword,
        });
    
        await novoLar.save();
        res.status(201).json({ message: "Cadastro enviado com sucesso." });
      } catch (err) {
        res.status(500).json({ message: "Erro ao salvar cadastro.", error: err.message });
      }
    });
    


export default router;
