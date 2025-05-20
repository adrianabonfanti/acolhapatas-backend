require("dotenv").config(); // <- primeira linha
const express = require("express");
app.use((req, res, next) => {
  console.log("📡 ROTA CHAMADA:", req.method, req.url);
  next();
});

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const ongRoutes = require("./routes/ongs");
const publicOngRoutes = require("./routes/publicOngs");
const publicAnimalsFilters = require("./routes/publicAnimalsFilters");

const publicAnimalsRoutes = require("./routes/publicAnimals");
const larTemporarioRoutes = require("./routes/lartemporario");
const animalsRoutes = require("./routes/animals");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middlewares/authMiddleware");
const animalsLarRoutes = require("./routes/animalsLar");
const adminLoginRoutes = require("./routes/adminLogin");
const adminRoutes = require("./routes/admin");
const contatoRoutes = require("./routes/contato");
const eventosRoutes = require("./routes/eventos");
const interesseEventosRoutes = require("./routes/interesseEventos");
const voluntariosRoutes = require("./routes/voluntarios");
const animaisOngRoutes = require("./routes/animalRoutes");


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
app.use("/ongs", animaisOngRoutes);

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
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
