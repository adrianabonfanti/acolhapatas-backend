// controllers/animalController.js

import Animal from '../models/Animal.js';
import LarTemporario from '../models/LarTemporario.js';
import ONG from '../models/Ong.js';
import sendEmail from '../utils/sendEmail.js';

export async function cadastrarAnimal(req, res) {
  try {
    const novoAnimal = new Animal(req.body);
    await novoAnimal.save();

    // Verifica se precisa de lar temporário
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
            message: `Olá ${lar.nome},\n\nA ONG ${ong.nome} acabou de cadastrar um animal que se encaixa no perfil que você aceita.\n\nAcesse sua área logada no AcolhaPatas para saber mais: https://acolhapatas.vercel.app/login\n\nObrigado por ser um lar temporário! ❤️`
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
