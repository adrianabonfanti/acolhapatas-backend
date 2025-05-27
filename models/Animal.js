const mongoose = require("mongoose");


const AnimalSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["adocao", "precisa-lar", "adotado"],
    default: "adocao"
  },
  especie: String,
  sexo: String,
  porte: String,
  idade: String,
  medicacao: String,
  necessidadesEspeciais: String,
  precisaLarTemporario: {
    type: Boolean,
    default: false,
  },
  
  castrado: {
    type: Boolean,
    default: false
  },
  vacinado: {
    type: Boolean,
    default: false
  },
  deficiencia: {
    type: Boolean,
    default: false
  },
  usaMedicacao: {
    type: Boolean,
    default: false
  },
  status: {
  type: String,
  enum: ["ativo", "adotado", "pausado"],
  default: "ativo"
},
achouLar: {
  type: Boolean,
  default: false
},
  descricao: {
    type: String
  },
  fotos: [String], // já tava, mas agora organizadinho
  
  ong: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ong",
    required: true,
  }
}, { timestamps: true }); // Garante o createdAt e updatedAt

const Animal = mongoose.model("Animal", AnimalSchema);
module.exports = Animal;
