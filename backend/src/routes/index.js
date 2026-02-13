const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const homeRoutes = require('../modules/home/home.routes');
const ocorrenciasRoutes = require('../modules/ocorrencias/ocorrencias.routes');
const inventarioRoutes = require('../modules/inventario/inventario.routes');
const clientesRoutes = require('../modules/clientes/clientes.routes');
const adminRoutes = require('../modules/admin/admin.routes');
const apiExternaRoutes = require('../modules/api/api.routes');
const conhecimentoRoutes = require('../modules/conhecimento/conhecimento.routes');

const { authenticate } = require('../middlewares/auth');

// Rotas públicas
router.use('/auth', authRoutes);

// Rotas protegidas
router.use('/home', authenticate, homeRoutes);
router.use('/ocorrencias', authenticate, ocorrenciasRoutes);
router.use('/inventario', authenticate, inventarioRoutes);
router.use('/clientes', authenticate, clientesRoutes);
router.use('/admin', authenticate, adminRoutes);
router.use('/conhecimento', authenticate, conhecimentoRoutes);

// API Externa (autenticação por token)
router.use('/external', apiExternaRoutes);

// Rota 404
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

module.exports = router;
