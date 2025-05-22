// controllers/animalController.js

const Animal = require("../models/Animal");
const LarTemporario = require("../models/LarTemporario");
const ONG = require("../models/Ong");
const sendEmail = require("../utils/sendEmail");


async function cadastrarAnimal(req, res) {
  console.log("📦 req.body.precisaLarTemporario:", req.body.precisaLarTemporario);

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
console.log("🐾 novoAnimal.precisaLarTemporario:", novoAnimal.precisaLarTemporario);

console.log("✅ Animal salvo no banco.");
const animalPopulado = await Animal.findById(novoAnimal._id).populate("ong");
console.log("✅ Animal populado:", animalPopulado);

// ENVIA E-MAILS ANTES DA RESPOSTA
if (novoAnimal.precisaLarTemporario) {
  console.log("🧪 Tipo de precisaLarTemporario:", typeof novoAnimal.precisaLarTemporario);
console.log("🧪 Valor de precisaLarTemporario:", novoAnimal.precisaLarTemporario);

 try {
  console.log("🧪 FORÇANDO ENVIO DE E-MAIL (ignorar precisaLarTemporario)");

  const todosLares = await LarTemporario.find({ approved: true });
  console.log("🔍 Total de lares encontrados:", todosLares.length);

  const laresCompatíveis = todosLares; // ignora filtro pra testar
  console.log("🎯 Enviando para todos os lares compatíveis");

await Promise.allSettled(
  laresCompatíveis.map(async (lar) => {
    console.log(`📨 Tentando enviar para: ${lar.email}`);
    try {
      await sendEmail({
        name: lar.nome,
        email: lar.email,
        phone: lar.telefone,
        subject: `🐾 Novo animal precisa de lar temporário!`,
        html: `
          <h2>Olá ${lar.nome}!</h2>
          <p>Uma ONG cadastrou um animal que precisa de lar temporário.</p>
          <p><strong>Animal:</strong> ${animalPopulado.nome}</p>
          <p><strong>ONG responsável:</strong> ${animalPopulado.ong?.name || "ONG não identificada"}</p>
          <p><strong>Descrição:</strong> ${animalPopulado.descricao || "Sem descrição fornecida"}</p>
          <p>Se você puder ajudar, acesse sua área logada do sistema AcolhaPatas:</p>
          <p><a href="https://acolhapatas.com.br/login" target="_blank">https://acolhapatas.com.br/login</a></p>
          <br />
          <p>Obrigado por fazer parte dessa rede de apoio! 💚</p>
        `
      });
      console.log("✅ E-mail enviado com sucesso para:", lar.email);
    } catch (err) {
      console.error(`❌ Erro ao enviar e-mail para ${lar.email}:`, err.message);
    }
  })
);

} catch (err) {
  console.error("❌ Erro no pós-processamento (forçado):", err);
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


