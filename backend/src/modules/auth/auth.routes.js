const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middlewares/auth');

// Rotas públicas
router.post('/login', authController.login);

// Rotas protegidas
router.get('/me', authenticate, authController.me);
router.post('/refresh', authenticate, authController.refresh);
router.post('/alterar-senha', authenticate, authController.alterarSenha);

module.exports = router;
