const mongoose = require("mongoose");


const VoluntarioEventoSchema = new mongoose.Schema({
  nome: String,
  telefone: String,
  evento: { type: mongoose.Schema.Types.ObjectId, ref: "Evento" }
}, { timestamps: true });

module.exports = mongoose.model("VoluntarioEvento", VoluntarioEventoSchema);

