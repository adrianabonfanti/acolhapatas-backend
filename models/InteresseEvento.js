const mongoose = require("mongoose");

const InteresseEventoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  ongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ong" }],
  cidade: { type: String },
  estado: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("InteresseEvento", InteresseEventoSchema);
