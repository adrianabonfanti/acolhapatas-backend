// routes/animalRoutes.js

import express from 'express';
import { cadastrarAnimal } from '../controllers/animalController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rota para cadastro de animal (ONG logada)
router.post('/ongs/animais', authMiddleware, cadastrarAnimal);

export default router;
