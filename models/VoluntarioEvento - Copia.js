import mongoose from "mongoose";

const VoluntarioEventoSchema = new mongoose.Schema({
  nome: String,
  telefone: String,
  evento: { type: mongoose.Schema.Types.ObjectId, ref: "Evento" }
}, { timestamps: true });

export default mongoose.model("VoluntarioEvento", VoluntarioEventoSchema);
