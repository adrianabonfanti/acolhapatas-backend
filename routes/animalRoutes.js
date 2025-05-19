// routes/animalRoutes.js

const express = require('express');
const { cadastrarAnimal } = require('../controllers/animalController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');


const router = express.Router();

// Rota para cadastro de animal (ONG logada)
router.post('/ongs/animais', authMiddleware, upload.single("fotos"), cadastrarAnimal);


module.exports = router;

