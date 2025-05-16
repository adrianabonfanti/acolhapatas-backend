
import express from 'express';
import multer from 'multer';
import Evento from '../models/Evento.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/eventos/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.use(authMiddleware);

// POST: Criar novo evento
router.post('/', upload.single('imagem'), async (req, res) => {
  try {
    const novoEvento = new Evento({
      ...req.body,
      ong: req.user.id,
      imagem: req.file ? `/uploads/eventos/${req.file.filename}` : undefined
    });
    const salvo = await novoEvento.save();
    res.status(201).json(salvo);
  } catch (err) {
    console.error("💥 ERRO AO SALVAR EVENTO:", err);
    res.status(500).json({ erro: 'Erro ao salvar evento.', detalhes: err.message });
  }
});

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
      ...req.body,
      imagem: req.file ? `/uploads/eventos/${req.file.filename}` : req.body.imagem
    };
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
