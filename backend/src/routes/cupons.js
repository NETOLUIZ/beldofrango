const express = require('express');
const { validar } = require('../controllers/cupomController');

const router = express.Router();

router.post('/validar', validar);

module.exports = router;
