// controllers/animalController.js

const Animal = require("../models/Animal");
const LarTemporario = require("../models/LarTemporario");
const ONG = require("../models/Ong");
const sendEmail = require("../utils/sendEmail");


async function cadastrarAnimal(req, res) {
  
  try {
    console.log("🔥 ENTROU no controller cadastrarAnimal");
console.log("req.body.ong:", req.body.ong);
    if (!req.body.nome) {
      return res.status(400).json({ error: "Campo nome é obrigatório." });
    }

    const fotos = req.file ? [req.file.path] : [];

    const body = {
      ...req.body,
      nome: String(req.body.nome),
      castrado: req.body.castrado === "true" || req.body.castrado === true,
      vacinado: req.body.vacinado === "true" || req.body.vacinado === true,
      precisaLarTemporario:
        req.body.precisaLarTemporario === "true" || req.body.precisaLarTemporario === true,
      necessidadesEspeciais:
        req.body.necessidadesEspeciais === "true" || req.body.necessidadesEspeciais === true,
      usaMedicacao: req.body.usaMedicacao === "true" || req.body.usaMedicacao === true,
      deficiencia: req.body.deficiencia === "true" || req.body.deficiencia === true,
    };
const ongId = req.body.ong || req.user?.id;
if (!ongId) {
  return res.status(400).json({ error: "ONG não identificada." });
}
    const novoAnimal = new Animal({
      ...body,
      fotos,
      ong: ongId,
    });

await novoAnimal.save();
console.log("✅ Animal salvo no banco.");
const animalPopulado = await Animal.findById(novoAnimal._id).populate("ong");
console.log("✅ Animal populado:", animalPopulado);

// ENVIA E-MAILS ANTES DA RESPOSTA
if (novoAnimal.precisaLarTemporario) {
  console.log("🧪 Tipo de precisaLarTemporario:", typeof novoAnimal.precisaLarTemporario);
console.log("🧪 Valor de precisaLarTemporario:", novoAnimal.precisaLarTemporario);

  try {
    console.log("✉️ Preparando para buscar lares compatíveis...");


    const todosLares = await LarTemporario.find({ approved: true });
    console.log("🔍 Total de lares encontrados:", todosLares.length);
    const laresCompatíveis = todosLares.filter((lar) => {    

      return (
        (!lar.especie || lar.especie.map(e => e.toLowerCase()).includes(novoAnimal.especie.toLowerCase())) &&
        (!lar.sexo || lar.sexo.toLowerCase() === novoAnimal.sexo.toLowerCase() || lar.sexo === 'ambos' || lar.sexo === 'tanto-faz') &&
        (!lar.porte || lar.porte.map(p => p.toLowerCase()).includes(novoAnimal.porte.toLowerCase())) &&
        (!lar.idade || lar.idade.map(i => i.toLowerCase()).includes(novoAnimal.idade.toLowerCase())) &&
        (!novoAnimal.deficiencia || lar.necessidadesEspeciais) &&
        (!novoAnimal.usaMedicacao || lar.medicacao)
      );
    });
console.log("🎯 Lares compatíveis:", laresCompatíveis.length);
   const resultados = await Promise.allSettled(
  laresCompatíveis.map(async (lar) => {
    console.log(`📨 Tentando enviar para: ${lar.email}`);
    try {
      await sendEmail({
        name: lar.nome,
        email: lar.email,
        phone: lar.telefone,
        message: `Olá ${lar.nome}, a ONG ${ong.name} acabou de cadastrar um animal que bate com o seu perfil. Acesse o sistema e veja mais detalhes.`,
      });
      console.log("✅ E-mail enviado com sucesso para:", lar.email);
    } catch (err) {
      console.error(`❌ Erro ao enviar e-mail para ${lar.email}:`, err.message);
    }
  })
);

  } catch (err) {
    console.error("Erro no pós-processamento (lares/e-mail):", err.message);
  }
}

// AGORA SIM, envia a resposta
res.status(201).json(animalPopulado);


   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar animal.' });
  }
}




async function atualizarAnimal(req, res) {
  return res.status(501).json({ error: "Função atualizarAnimal não implementada neste arquivo." });
}

module.exports = {
  cadastrarAnimal,
  atualizarAnimal
};


