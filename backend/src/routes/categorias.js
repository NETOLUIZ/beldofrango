const express = require('express');
const { listarPublico } = require('../controllers/categoriaController');

const router = express.Router();

router.get('/', listarPublico);

module.exports = router;
