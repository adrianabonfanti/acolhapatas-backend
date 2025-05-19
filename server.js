import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import ongRoutes from "./routes/ongs.js";
import publicOngRoutes from "./routes/publicOngs.js";
import publicAnimalsFilters from "./routes/publicAnimalsFilters.js"; 

import publicAnimalsRoutes from "./routes/publicAnimals.js"; 
import larTemporarioRoutes from "./routes/lartemporario.js";
import animalsRoutes from "./routes/animals.js";
import authRoutes from "./routes/auth.js"; 
import authMiddleware from "./middlewares/authMiddleware.js"; 
import animalsLarRoutes from "./routes/animalsLar.js"; 
import adminLoginRoutes from "./routes/adminLogin.js";
import adminRoutes from "./routes/admin.js";
import contatoRoutes from "./routes/contato.js"; 
import eventosRoutes from "./routes/eventos.js"; 
import interesseEventosRoutes from "./routes/interesseEventos.js";
import voluntariosRoutes from "./routes/voluntarios.js";
import animaisOngRoutes from "./routes/animalRoutes.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: "https://www.acolhapatas.com.br",
  credentials: true
}));

app.use("/uploads", express.static("uploads"));
app.use(express.json());

app.use("/contato", contatoRoutes);
// Rotas públicas (não precisam de token)
app.use("/ongs", ongRoutes); 
app.use("/public/ongs", publicOngRoutes);
app.use("/public/animals", publicAnimalsFilters);
app.use("/", interesseEventosRoutes);

app.use("/", publicAnimalsRoutes);
app.use("/lartemporario", larTemporarioRoutes);
app.use("/", authRoutes);
app.use("/voluntarios", voluntariosRoutes);
app.use("/admin", adminLoginRoutes);
app.use("/admin", adminRoutes);
app.use("/", animaisOngRoutes);

// Rotas privadas (precisam de token)
app.use("/animals", authMiddleware, animalsRoutes);
app.use("/animals", animalsRoutes); // sem o middleware global aqui
app.use("/", animalsLarRoutes); // USA CERTO
app.use('/eventos', eventosRoutes);

// Middleware para capturar erros e exibir no console do Render
app.use((err, req, res, next) => {
  console.error("ERRO GERAL:", err?.stack || err);
  res.status(500).json({ message: "Erro interno do servidor", erro: err?.message || String(err) });
});

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

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
