const express = require('express');
const { listarPublico, buscarPorId } = require('../controllers/produtoController');

const router = express.Router();

router.get('/', listarPublico);
router.get('/:id', buscarPorId);

module.exports = router;
