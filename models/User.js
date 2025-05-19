const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  tipo: String, // "ong" ou "lar"
  aprovado: { type: Boolean, default: false },
  ong: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ong",
    required: function () {
      return this.tipo === "ong";
    }
  }
});

module.exports = mongoose.model("User", userSchema);
