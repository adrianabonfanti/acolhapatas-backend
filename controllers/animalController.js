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
const animalPopulado = await Animal.findById(novoAnimal._id).populate("ong");

res.status(201).json(animalPopulado);




// Continua o pós-processamento depois da resposta:
if (novoAnimal.precisaLarTemporario) {
  try {
    const todosLares = await LarTemporario.find({ approved: true });

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

    if (laresCompatíveis.length > 0) {
/*     let nomeDaOng = "a ONG";

try {
  const ong = await ONG.findById(String(novoAnimal.ong));
  if (ong?.name) {
    nomeDaOng = ong.name;
  } else {
    console.warn("⚠️ ONG encontrada, mas sem campo 'name'");
  }
} catch (erroOng) {
  console.warn("❌ Erro ao buscar nome da ONG:", erroOng.message);
} */



      for (const lar of laresCompatíveis) {
        await sendEmail({
          name: lar.nome,
          email: lar.email,
          phone: lar.telefone,
          message: `Olá ${lar.nome},\n\nUm novo animal foi cadastrado e se encaixa no perfil que você aceita:\n\n• Espécie: ${novoAnimal.especie}\n• Idade: ${novoAnimal.idade}\n• Porte: ${novoAnimal.porte}\n• Sexo: ${novoAnimal.sexo}\n\nAcesse sua área logada no AcolhaPatas para saber mais: https://acolhapatas.com.br/login\n\nObrigado por ser um lar temporário! ❤️`

        });
      }
    }
  } catch (err) {
    console.error("Erro no pós-processamento (lares/e-mail):", err.message);
  }
}

   
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


