// controllers/animalController.js

import Animal from '../models/Animal.js';
import LarTemporario from '../models/LarTemporario.js';
import ONG from '../models/Ong.js';
import sendEmail from '../utils/sendEmail.js';

export async function cadastrarAnimal(req, res) {
  try {
    if (!req.body.nome) {
      return res.status(400).json({ error: "Campo nome é obrigatório." });
    }

    const fotos = req.file ? [req.file.path] : [];

    const body = {
      ...req.body,
      nome: String(req.body.nome),
      castrado: req.body.castrado === "true" || req.body.castrado === true,
      vacinado: req.body.vacinado === "true" || req.body.vacinado === true,
      precisaLarTemporario: req.body.precisaLarTemporario === "true" || req.body.precisaLarTemporario === true,
      necessidadesEspeciais: req.body.necessidadesEspeciais === "true" || req.body.necessidadesEspeciais === true,
      usaMedicacao: req.body.usaMedicacao === "true" || req.body.usaMedicacao === true,
      deficiencia: req.body.deficiencia === "true" || req.body.deficiencia === true
    };

    const novoAnimal = new Animal({
      ...body,
      fotos,
      ong: req.user.id,
    });

    await novoAnimal.save();

    if (novoAnimal.precisaLarTemporario) {
      const todosLares = await LarTemporario.find({ approved: true });

      const laresCompatíveis = todosLares.filter((lar) => {
        return (
          (!lar.especie || lar.especie.includes(novoAnimal.especie)) &&
          (!lar.sexo || lar.sexo === novoAnimal.sexo || lar.sexo === 'ambos') &&
          (!lar.porte || lar.porte.includes(novoAnimal.porte)) &&
          (!lar.idade || lar.idade.includes(novoAnimal.idade)) &&
          (!novoAnimal.deficiencia || lar.necessidadesEspeciais) &&
          (!novoAnimal.usaMedicacao || lar.medicacao)
        );
      });

      if (laresCompatíveis.length > 0) {
        const ong = await ONG.findById(novoAnimal.ong);

        for (const lar of laresCompatíveis) {
          await sendEmail({
            name: lar.nome,
            email: lar.email,
            phone: lar.telefone,
            message: `Olá ${lar.nome},\n\nA ONG ${ong.nome} acabou de cadastrar um animal que se encaixa no perfil que você aceita:\n\n• Espécie: ${novoAnimal.especie}\n• Idade: ${novoAnimal.idade}\n• Porte: ${novoAnimal.porte}\n• Sexo: ${novoAnimal.sexo}\n\nAcesse sua área logada no AcolhaPatas para saber mais: https://acolhapatas.vercel.app/login\n\nObrigado por ser um lar temporário! ❤️`
          });
        }
      }
    }

    res.status(201).json(novoAnimal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar animal.' });
  }
}

export async function atualizarAnimal(req, res) {
  return res.status(501).json({ error: "Função atualizarAnimal não implementada neste arquivo." });
}
