import mongoose from "mongoose";

const larTemporarioSchema = new mongoose.Schema({
  nome: String,
  cep: String,
  rua: String,
  numero: String,
  complemento: String,
  cidade: String,
  estado: String,
  telefone: String,
  email: String,
  password: String,
  foto: {
    type: String, // URL do Cloudinary
  },
  
  

  especie: [String],
  porte: [String],
  idade: [String],
  sexo: {
    type: String,
    enum: ["macho", "femea", "tanto-faz"],
    required: true
  },
  medicacao: Boolean,
  tratamento: Boolean,
  necessidadesEspeciais: Boolean,
  quantidade: Number,

  bemEstar: String,
  acessoRua: String,
  tela: String,

  approved: { type: Boolean, default: false },
});

export default mongoose.model("LarTemporario", larTemporarioSchema);
