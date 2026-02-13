const express = require('express');
const router = express.Router();
const { authorize } = require('../../middlewares/auth');

// Importar sub-rotas
const usuariosRoutes = require('./usuarios.routes');
const configuracoes = require('./configuracoes.routes');

// Middleware para verificar se é admin
const isAdmin = (req, res, next) => {
  const admin = req.user.roles?.some(role => role.nivel === 1);
  if (!admin) {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

router.use(isAdmin);

// Sub-rotas
router.use('/usuarios', usuariosRoutes);
router.use('/configuracoes', configuracoes);

module.exports = router;
