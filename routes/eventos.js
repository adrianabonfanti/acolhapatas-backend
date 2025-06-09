const express = require('express');
const Evento = require('../models/Evento');
const Ong = require('../models/Ong');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const InteresseEvento = require("../models/InteresseEvento");
const sendEmail = require("../utils/sendEmail");
const Voluntario = require("../models/VoluntarioEvento");

const router = express.Router();

// ROTA PÚBLICA: Buscar eventos futuros para vitrine
router.get("/public", async (req, res) => {
  try {
    const hoje = new Date().toISOString().slice(0, 10);
    const eventos = await Evento.find({
      data: { $gte: hoje },
      ong: { $ne: null }
    }).sort({ data: 1 }).populate("ong");

    res.json(eventos);
  } catch (err) {
    console.error("💥 ERRO AO BUSCAR EVENTOS PÚBLICOS:", err);
    res.status(500).json({ erro: "Erro ao buscar eventos públicos." });
  }
});

// POST: Voluntário se inscrevendo no evento
router.post("/voluntarios", async (req, res) => {
  try {
    const { nome, telefone, evento } = req.body;

    const eventoEncontrado = await Evento.findById(evento).populate("ong");
    if (!eventoEncontrado) return res.status(404).json({ erro: "Evento não encontrado" });

    const emailONG = eventoEncontrado.ong?.email;
    if (!emailONG) {
      return res.status(400).json({ erro: "ONG não possui e-mail cadastrado" });
    }

    // Salvar o voluntário
    await Voluntario.create({ nome, telefone, evento });

    const [ano, mes, dia] = eventoEncontrado.data.split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;

    const mensagem = `Quero ser voluntário para o evento ${eventoEncontrado.nome}

Data: ${dataFormatada}
Local: ${eventoEncontrado.endereco || "Endereço não informado"}
Cidade: ${eventoEncontrado.cidade} - ${eventoEncontrado.estado}`;

    await sendEmail({
      name: nome,
      email: emailONG,
      phone: telefone,
      message: mensagem,
      subject: `Novo voluntário para evento: ${eventoEncontrado.nome}`
    });

    res.status(201).json({ msg: "Voluntário salvo e notificado com sucesso." });
  } catch (err) {
    console.error("💥 ERRO AO SALVAR VOLUNTÁRIO:", err);
    res.status(500).json({ erro: "Erro ao salvar voluntário", detalhes: err.message });
  }
});

router.use(authMiddleware);

// POST: Criar novo evento
router.post('/', upload.single('imagem'), async (req, res) => {
  try {
    const imagem = req.file ? req.file.path : null;

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
    salvo.cidade = salvo.cidade?.trim() || "";
    salvo.estado = salvo.estado?.trim().toUpperCase() || "";
    await salvo.populate("ong");

    const interessados = await InteresseEvento.find();

    for (const i of interessados) {
      const correspondeCidade = i.cidade === "" || i.cidade.toLowerCase() === salvo.cidade.toLowerCase();
      const correspondeEstado = i.estado === "" || i.estado.toUpperCase() === salvo.estado.toUpperCase();

      if (correspondeCidade && correspondeEstado) {
        const [ano, mes, dia] = salvo.data.split("-");
        const dataFormatada = `${dia}/${mes}/${ano}`;

        const conteudo = `
          <p>Olá ${i.nome},</p>
          <p>Um novo evento pode te interessar:</p>
          <ul>
            <p><strong>ONG responsável:</strong> ${salvo.ong?.nome || salvo.ong?.name || "ONG não identificada"}</p>
            <li><strong>${salvo.nome}</strong></li>
            <li><strong>Data:</strong> ${dataFormatada}</li>
            <li><strong>Horário:</strong> ${salvo.horaInicio} às ${salvo.horaFim}</li>
            <li><strong>Local:</strong> ${salvo.endereco}, ${salvo.cidade} - ${salvo.estado}</li>
            ${salvo.descricao ? `<li><strong>Descrição:</strong> ${salvo.descricao}</li>` : ""}
          </ul>
          ${
            salvo.precisaVoluntario
              ? `<p><strong>Este evento está precisando de voluntários!</strong><br>Acesse <a href="https://acolhapatas.com.br/eventos">acolhapatas.com.br/eventos</a> para confirmar sua participação.</p>`
              : ""
          }
          <p><a href="https://acolhapatas.com.br/eventos">Clique aqui para ver todos os eventos</a></p>
        `;

        await sendEmail({
          name: i.nome,
          email: i.email,
          subject: `Novo evento do AcolhaPatas: ${salvo.nome}`,
          html: conteudo
        });
      }
    }

    res.status(201).json(salvo);
  } catch (err) {
    console.error("💥 ERRO AO SALVAR EVENTO:", err);
    res.status(500).json({ erro: 'Erro ao salvar evento.', detalhes: err.message });
  }
});

// GET: Buscar todos os eventos (admin)
router.get("/todos", async (req, res) => {
  try {
    const eventos = await Evento.find().sort({ data: -1 }).populate("ong");
    res.json(eventos);
  } catch (err) {
    console.error("💥 ERRO AO BUSCAR TODOS OS EVENTOS:", err);
    res.status(500).json({ erro: "Erro ao buscar todos os eventos." });
  }
});

// GET: Buscar eventos da ONG
router.get('/', async (req, res) => {
  try {
    const filtros = { ong: req.user.id };
    if (req.query.nome) filtros.nome = new RegExp(req.query.nome, 'i');
    if (req.query.data) filtros.data = req.query.data;
    if (req.query.precisaVoluntario) filtros.precisaVoluntario = req.query.precisaVoluntario === 'true';

    const eventos = await Evento.find(filtros).sort({ data: 1 });

    const eventosComContagem = await Promise.all(eventos.map(async (evento) => {
      const count = await Voluntario.countDocuments({ evento: evento._id });
      return { ...evento.toObject(), voluntariosCount: count };
    }));

    res.json(eventosComContagem);
  } catch (err) {
    console.error("💥 ERRO AO BUSCAR EVENTOS:", err);
    res.status(500).json({ erro: 'Erro ao buscar eventos.', detalhes: err.message });
  }
});

// PUT: Editar evento
router.put('/:id', upload.single('imagem'), async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) update.imagem = req.file.path;

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

module.exports = router;
