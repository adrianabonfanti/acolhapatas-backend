
import express from 'express';
import Evento from '../models/Evento.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';
import InteresseEvento from "../models/InteresseEvento.js";
import sendEmail from "../utils/sendEmail.js"; 

const router = express.Router();


// ROTA PÚBLICA: Buscar eventos futuros para vitrine
router.get("/public", async (req, res) => {
  try {
    const hoje = new Date().toISOString().slice(0, 10);
    const eventos = await Evento.find({ 
  data: { $gte: hoje },
  ong: { $ne: null } // ✅ apenas eventos com ONG associada
}).sort({ data: 1 }).populate("ong");

    res.json(eventos);
  } catch (err) {
    console.error("💥 ERRO AO BUSCAR EVENTOS PÚBLICOS:", err);
    res.status(500).json({ erro: "Erro ao buscar eventos públicos." });
  }
});


router.use(authMiddleware);

// POST: Criar novo evento
router.post('/', upload.single('imagem'), async (req, res) => {
  try {
    const imagem = req.file ? req.file.path : null;
  // Converte a data para formato ISO se estiver em formato brasileiro
    if (req.body.data && req.body.data.includes("/")) {
      const [dia, mes, ano] = req.body.data.split("/");
      req.body.data = `${ano}-${mes}-${dia}`;
    } 
    const novoEvento = new Evento({
      ...req.body,
      ong: req.user.id,
      imagem
    });

    const salvo = await novoEvento.save();
    res.status(201).json(salvo);
  } catch (err) {
    console.error("💥 ERRO AO SALVAR EVENTO:", err);
    res.status(500).json({ erro: 'Erro ao salvar evento.', detalhes: err.message });
  }
});
const interessados = await InteresseEvento.find();

for (const i of interessados) {
  const correspondeONG = i.ongs.length === 0 || i.ongs.includes(novoEvento.ong.toString());
  const correspondeCidade = !i.cidade || i.cidade.toLowerCase() === novoEvento.cidade.toLowerCase();
  const correspondeEstado = !i.estado || i.estado.toUpperCase() === novoEvento.estado.toUpperCase();

  if (correspondeONG && correspondeCidade && correspondeEstado) {
    const dataFormatada = new Date(novoEvento.data).toLocaleDateString("pt-BR");
    const conteudo = `
      <p>Olá ${i.nome},</p>
      <p>Um novo evento do AcolhaPatas pode te interessar:</p>
      <ul>
        <li><strong>${novoEvento.nome}</strong></li>
        <li><strong>Data:</strong> ${dataFormatada}</li>
        <li><strong>Horário:</strong> ${novoEvento.horaInicio} às ${novoEvento.horaFim}</li>
        <li><strong>Local:</strong> ${novoEvento.endereco}, ${novoEvento.cidade} - ${novoEvento.estado}</li>
        ${novoEvento.descricao ? `<li><strong>Descrição:</strong> ${novoEvento.descricao}</li>` : ""}
      </ul>
      ${
        novoEvento.precisaVoluntario
          ? `<p><strong>Este evento está precisando de voluntários!</strong><br>Acesse <a href="https://acolhapatas.com.br/eventos">acolhapatas.com.br/eventos</a> para confirmar sua participação.</p>`
          : ""
      }
      <p><a href="https://acolhapatas.com.br/eventos">Clique aqui para ver todos os eventos</a></p>
    `;

    await sendEmail({
      name: i.nome,
      email: i.email,
      html: conteudo
    });
  }
}
// GET: Buscar eventos da ONG
router.get('/', async (req, res) => {
  try {
    const filtros = { ong: req.user.id };
    if (req.query.nome) filtros.nome = new RegExp(req.query.nome, 'i');
    if (req.query.data) filtros.data = req.query.data;
    if (req.query.precisaVoluntario) filtros.precisaVoluntario = req.query.precisaVoluntario === 'true';

    const eventos = await Evento.find(filtros).sort({ data: -1 });
    res.json(eventos);
  } catch (err) {
    console.error("💥 ERRO AO BUSCAR EVENTOS:", err);
    res.status(500).json({ erro: 'Erro ao buscar eventos.', detalhes: err.message });
  }
});

// PUT: Editar evento
router.put('/:id', upload.single('imagem'), async (req, res) => {
  try {
    const update = {
      ...req.body
    };

    if (req.file) {
      update.imagem = req.file.path;
    }

    const evento = await Evento.findOneAndUpdate(
      { _id: req.params.id, ong: req.user.id },
      update,
      { new: true }
    );
    res.json(evento);
  } catch (err) {
    console.error("💥 ERRO AO EDITAR EVENTO:", err);
    res.status(500).json({ erro: 'Erro ao editar evento.', detalhes: err.message });
  }
});

// DELETE: Apagar evento
router.delete('/:id', async (req, res) => {
  try {
    await Evento.deleteOne({ _id: req.params.id, ong: req.user.id });
    res.json({ msg: 'Evento apagado com sucesso.' });
  } catch (err) {
    console.error("💥 ERRO AO APAGAR EVENTO:", err);
    res.status(500).json({ erro: 'Erro ao apagar evento.', detalhes: err.message });
  }
});

// POST: Clonar evento
router.post('/:id/clonar', async (req, res) => {
  try {
    const original = await Evento.findOne({ _id: req.params.id, ong: req.user.id });
    if (!original) return res.status(404).json({ erro: 'Evento original não encontrado' });

    const copia = new Evento({
      ...original.toObject(),
      _id: undefined,
      criadoEm: new Date(),
      data: '',
      horaInicio: '',
      horaFim: ''
    });
    const salvo = await copia.save();
    res.json(salvo);
  } catch (err) {
    console.error("💥 ERRO AO CLONAR EVENTO:", err);
    res.status(500).json({ erro: 'Erro ao clonar evento.', detalhes: err.message });
  }
});

export default router;
