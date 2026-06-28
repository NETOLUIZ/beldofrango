const express = require('express');
const { login, logout, me, alterarSenha } = require('../controllers/authController');
const { autenticarAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', autenticarAdmin, me);
router.put('/senha', autenticarAdmin, alterarSenha);

module.exports = router;
