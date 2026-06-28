const express = require('express');
const { listarPublico } = require('../controllers/marmitaTamanhoController');

const router = express.Router();

router.get('/', listarPublico);

module.exports = router;
