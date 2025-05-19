const mongoose = require("mongoose");


const ongSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cnpj: { type: String, required: true },
  cep: { type: String, required: true },
  street: { type: String, required: true },
  number: { type: String, required: true },
  complement: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  responsibleName: { type: String, required: true },
  responsibleEmail: { type: String, required: true },
  password: { type: String, required: true },
  logo: { type: String },
  phone: { type: String },
  website: { type: String },
  instagram: { type: String },
  tiktok: { type: String },
  approved: { type: Boolean, default: false },
});

const Ong = mongoose.model("Ong", ongSchema);

module.exports = Ong;
