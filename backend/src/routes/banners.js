const express = require('express');
const { listarPublico } = require('../controllers/bannerController');

const router = express.Router();

router.get('/', listarPublico);

module.exports = router;
