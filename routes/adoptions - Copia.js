import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
  const { nome, email, telefone, animalId } = req.body;
  // Aqui você pode futuramente enviar para a ONG por email ou salvar em um banco
  console.log("Novo pedido de adoção:", { nome, email, telefone, animalId });
  res.status(200).json({ message: "Pedido de adoção recebido com sucesso!" });
});

export default router;
