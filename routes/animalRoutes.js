const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const { cadastrarAnimal } = require('../controllers/animalController'); // <- ESSENCIA

const router = express.Router();

// Rota para cadastro de animal (ONG logada)
router.post('/ongs/animais', authMiddleware, upload.single("fotos"), cadastrarAnimal);


module.exports = router;

