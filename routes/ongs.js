const express = require("express");
const upload = require("../middlewares/upload");
const Ong = require("../models/Ong");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Cadastrar ONG
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const {
      name,
      cnpj,
      cep,
      street,
      number,
      complement,
      city,
      state,
      responsibleName,
      responsibleEmail,
      phone,
      password,
      website,
      instagram,
      tiktok,
    } = req.body;

    const logo = req.file ? req.file.path : null; // agora vem a URL do Cloudinary

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const novaOng = new Ong({
      name,
      cnpj,
      cep,
      street,
      number,
      complement,
      city,
      state,
      responsibleName,
      responsibleEmail,
      phone,
      instagram,
      tiktok,
      website,
      password: hashedPassword,
      logo,
    });

    await novaOng.save();
    res.status(201).json({ message: "ONG cadastrada com sucesso. Aguarde aprovação." });
  } catch (error) {
    console.error("Erro ao cadastrar ONG:", error);
    res.status(500).json({ error: "Erro ao cadastrar ONG." });
  }
});

// Buscar ONG pelo ID
router.get("/:id", async (req, res) => {
  try {
    const ong = await Ong.findById(req.params.id);
    if (!ong) {
      return res.status(404).json({ message: "ONG não encontrada" });
    }
    res.json(ong);
  } catch (error) {
    console.error("Erro ao buscar ONG:", error);
    res.status(500).json({ message: "Erro ao buscar ONG" });
  }
});

// Atualizar ONG
router.put("/:id", upload.single("logo"), async (req, res) => {
  try {
    const updatedFields = { ...req.body };

    if (req.file) {
      updatedFields.logo = req.file.path; // agora usa URL do Cloudinary
    }

    const updatedOng = await Ong.findByIdAndUpdate(req.params.id, updatedFields, { new: true });

    if (!updatedOng) {
      return res.status(404).json({ message: "ONG não encontrada" });
    }

    res.json({ message: "Dados atualizados com sucesso.", ong: updatedOng });
  } catch (error) {
    console.error("Erro ao atualizar ONG:", error);
    res.status(500).json({ message: "Erro ao atualizar ONG", error: error.message });
  }
});

module.exports = router;

