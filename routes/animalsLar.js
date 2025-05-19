const express = require("express");
const Animal = require("../models/Animal");


const router = express.Router();

// Rota para buscar animais filtrados para o HomeLar
router.get("/public/animals-lar", async (req, res) => {
  try {
    const filtro = {};
    console.log("FILTRO RECEBIDO:", req.query); 
    if (req.query.especie) {
      filtro.especie = {
        $in: Array.isArray(req.query.especie) ? req.query.especie : [req.query.especie],
      };
    }
    
    if (req.query.porte) {
      filtro.porte = {
        $in: Array.isArray(req.query.porte) ? req.query.porte : [req.query.porte],
      };
    }
    
    if (req.query.idade) {
      filtro.idade = {
        $in: Array.isArray(req.query.idade) ? req.query.idade : [req.query.idade],
      };
    }
    
    if (req.query.sexo && req.query.sexo !== "tanto-faz") {
      filtro.sexo = new RegExp(`^${req.query.sexo}$`, "i");
    }
    
      

    const animais = await Animal.find(filtro);
    res.json(animais);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao buscar animais para lar");
  }
});
router.get("/public/animais-filtrados-por-lar", async (req, res) => {
  try {
    const filtro = {};

    // Converte primeira letra para maiúscula (capitalize)
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Para cada filtro:
if (req.query.especie) {
  const especie = Array.isArray(req.query.especie) ? req.query.especie : [req.query.especie];
  filtro.especie = { $in: especie.map(capitalize) };
}

if (req.query.idade) {
  const idade = Array.isArray(req.query.idade) ? req.query.idade : [req.query.idade];
  filtro.idade = { $in: idade.map(capitalize) };
}

if (req.query.porte) {
  const porte = Array.isArray(req.query.porte) ? req.query.porte : [req.query.porte];
  filtro.porte = { $in: porte.map(capitalize) };
}


    if (req.query.sexo && req.query.sexo !== "tanto-faz") {
      const sexo = Array.isArray(req.query.sexo) ? req.query.sexo : [req.query.sexo];
      filtro.sexo = { $in: sexo.map((s) => new RegExp(`^${s}$`, "i")) };
    }

    if (req.query.necessidadesEspeciais === "true") {
      filtro.deficiencia = true;
    }
    
    if (req.query.medicacao === "true") {
      filtro.usaMedicacao = true;
    }
   
    filtro.precisaLarTemporario = true;
    console.log("FILTRO FINAL:", filtro);
    console.log("Filtro aplicado:", JSON.stringify(filtro, null, 2));
    const animais = await Animal.find(filtro);
    res.json(animais);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao buscar animais para lar");
  }
});

module.exports = router;

