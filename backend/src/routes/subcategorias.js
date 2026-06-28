const express = require('express');
const { listarPublico } = require('../controllers/subcategoriaController');

const router = express.Router();

router.get('/', listarPublico);

module.exports = router;
