
const Animal = require("../models/animal");
const LarTemporario = require("../models/lartemporarios");
const Ong = require("../models/ongs");
const sendEmail = require("../utils/sendEmail");

const cadastrarAnimal = async (req, res) => {
  try {
    console.log("🔥 CONTROLLER TESTE: cadastrarAnimal");

    console.log("📦 req.body.precisaLarTemporario:", req.body.precisaLarTemporario);

    const fotos = req.file ? req.file.filename : "";
    const novoAnimal = new Animal({
      nome: req.body.nome,
      especie: req.body.especie,
      idade: req.body.idade,
      sexo: req.body.sexo,
      porte: req.body.porte,
      descricao: req.body.descricao,
      castrado: req.body.castrado === "true" || req.body.castrado === true,
      vacinado: req.body.vacinado === "true" || req.body.vacinado === true,
      tratamento: req.body.tratamento === "true" || req.body.tratamento === true,
      medicacao: req.body.medicacao === "true" || req.body.medicacao === true,
      necessidadesEspeciais:
        req.body.necessidadesEspeciais === "true" || req.body.necessidadesEspeciais === true,
      precisaLarTemporario:
        req.body.precisaLarTemporario === "true" || req.body.precisaLarTemporario === true,
      status: req.body.status,
      fotos: fotos,
      ong: req.body.ong,
    });

    console.log("🐾 novoAnimal.precisaLarTemporario:", novoAnimal.precisaLarTemporario);

    await novoAnimal.save();

    const ongs = await Ong.find({ _id: req.body.ong });
    console.log("📢 ONG associada:", ongs[0]?.name || "ONG não encontrada");

    // ENVIO DE TESTE PARA A DIDI SOMENTE
    try {
      console.log("🧪 ENVIO DE TESTE: só para adrianahbonfanti@gmail.com");

      const fakeLar = {
        nome: "Didi Teste",
        email: "adrianahbonfanti@gmail.com",
        telefone: "(00) 00000-0000",
      };

      console.log(`📨 Tentando enviar para: ${fakeLar.email}`);
      await sendEmail({
        name: fakeLar.nome,
        email: fakeLar.email,
        phone: fakeLar.telefone,
        message: `⚠️ Este é um teste de envio de e-mail do AcolhaPatas após cadastro de animal.`,
      });
      console.log("✅ E-mail de teste enviado com sucesso para:", fakeLar.email);
    } catch (err) {
      console.error("❌ Erro ao enviar e-mail de teste:", err.message);
    }

    res.status(200).json({ message: "Animal salvo com sucesso!" });
  } catch (error) {
    console.error("❌ ERRO GERAL ao salvar animal:", error);
    res.status(500).json({ error: "Erro ao salvar animal." });
  }
};

module.exports = { cadastrarAnimal };
