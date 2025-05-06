import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import ongRoutes from "./routes/ongs.js";
import publicOngRoutes from "./routes/publicOngs.js";
import publicAnimalsRoutes from "./routes/publicAnimals.js"; 
import larTemporarioRoutes from "./routes/lartemporario.js";
import animalsRoutes from "./routes/animals.js";
import authRoutes from "./routes/auth.js"; 
import authMiddleware from "./middlewares/authMiddleware.js"; // <-- IMPORTADO aqui

dotenv.config();

const app = express();
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(express.json());

// Rotas públicas (não precisam de token)
app.use("/ongs", ongRoutes); 
app.use("/public/ongs", publicOngRoutes);
app.use("/", publicAnimalsRoutes);
app.use("/lartemporario", larTemporarioRoutes);
app.use("/", authRoutes);

// Rotas privadas (precisam de token)
app.use("/animals", authMiddleware, animalsRoutes);

// Conexão com banco
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro ao conectar no MongoDB:", err));

// Porta
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
