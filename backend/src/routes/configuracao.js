const express = require('express');
const { obter } = require('../controllers/configuracaoController');

const router = express.Router();

// Leitura pública (o cardápio do cliente precisa mostrar a taxa de entrega antes do checkout).
// Escrita continua só em /api/admin/configuracao.
router.get('/', obter);

module.exports = router;
