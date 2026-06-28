const express = require('express');
const { listarPublico } = require('../controllers/complementoController');

const router = express.Router();

router.get('/', listarPublico);

module.exports = router;
