const express = require('express');
const { criar, buscarPorCodigo } = require('../controllers/pedidoController');

const router = express.Router();

router.post('/', criar);
// Por código (UUID), nunca pelo id sequencial — ver comentário em buscarPorCodigo.
router.get('/:codigo', buscarPorCodigo);

module.exports = router;
