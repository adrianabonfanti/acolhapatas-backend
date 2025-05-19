const express = require('express');
const router = express.Router(); // <- só essa linha deve ficar

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const { cadastrarAnimal } = require('../controllers/animalController'); // <- ESSENCIAL

// Rota para cadastro de animal (ONG logada)
router.post('/ongs/animais', authMiddleware, upload.single("fotos"), cadastrarAnimal);
console.log("CONTROLLER TESTE:", cadastrarAnimal);

module.exports = router;
