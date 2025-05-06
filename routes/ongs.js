import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Ong from "../models/Ong.js";
import bcrypt from "bcryptjs"; // adicionar lá no topo também
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

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
      phone, // <-- adicionar
      password,
      website,
      instagram,
      tiktok,
    } = req.body;

    const logo = req.file ? req.file.filename : null;

  

// Criptografar a senha antes de salvar
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
router.put("/:id", upload.single("logo"), async (req, res) => {
  try {
    const updatedFields = { ...req.body };

    if (req.file) {
      updatedFields.logo = req.file.filename;
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

export default router;