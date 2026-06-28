const express = require('express');
const { listarPublico } = require('../controllers/proteinaController');

const router = express.Router();

router.get('/', listarPublico);

module.exports = router;
