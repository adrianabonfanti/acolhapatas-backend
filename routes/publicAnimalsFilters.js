import express from "express";
import Animal from "../models/Animal.js";

const router = express.Router();

// Buscar animais com filtros (público)
router.get("/", async (req, res) => {
  try {
    const query = {};

    if (req.query.nome) {
      query.nome = { $regex: req.query.nome, $options: "i" };
    }
    if (req.query.especie) {
      query.especie = { $in: Array.isArray(req.query.especie) ? req.query.especie : [req.query.especie] };
    }
    if (req.query.sexo) {
      query.sexo = { $in: Array.isArray(req.query.sexo) ? req.query.sexo : [req.query.sexo] };
    }
    if (req.query.idade) {
      query.idade = { $in: Array.isArray(req.query.idade) ? req.query.idade : [req.query.idade] };
    }
    if (req.query.porte) {
      query.porte = { $in: Array.isArray(req.query.porte) ? req.query.porte : [req.query.porte] };
    }

    const todosAnimais = await Animal.find(query).populate("ong");

    // Util para remover acentos e padronizar
    const normalizar = (texto) =>
      texto?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const ongFiltro = normalizar(req.query.ong || "");
    const cidadeFiltro = normalizar(req.query.cidade || "");
    const estadoFiltro = normalizar(req.query.estado || "");

    const animaisFiltrados = todosAnimais.filter((animal) => {
      const ong = animal.ong;

      const nomeOk =
      !ongFiltro ||
      (ong?.name && normalizar(ong.name).includes(ongFiltro)) ||
      (animal?.ong?.name && normalizar(animal.ong.name).includes(ongFiltro));
    
const cidadeOk = !cidadeFiltro || normalizar(ong?.city || "").includes(cidadeFiltro);
const estadoOk = !estadoFiltro || normalizar(ong?.state || "").includes(estadoFiltro);


      return nomeOk && cidadeOk && estadoOk;
    });

    res.json(animaisFiltrados);
  } catch (error) {
    console.error("Erro ao buscar animais públicos:", error);
    res.status(500).json({ message: "Erro ao buscar animais." });
  }
});


export default router;
