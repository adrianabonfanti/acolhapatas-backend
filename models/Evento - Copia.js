const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  ong: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ong',
    required: true
  },
  nome: { type: String, required: true },
  local: { type: String, required: true },
  endereco: { type: String },
  cidade: { type: String },
estado: { type: String },
  data: { type: String, required: true }, // formato: "2025-05-20"
  horaInicio: { type: String, required: true }, // formato: "14:00"
  horaFim: { type: String, required: true }, // formato: "17:00"
  descricao: { type: String },
  informacoesVoluntario: { type: String },
  imagem: { type: String }, // caminho do arquivo enviado
  precisaVoluntario: { type: Boolean, default: false },
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evento', eventoSchema);
