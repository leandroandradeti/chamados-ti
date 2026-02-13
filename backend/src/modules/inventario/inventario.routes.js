const express = require('express');
const router = express.Router();
const ativoController = require('./ativos.controller');
const { authorize } = require('../../middlewares/auth');

// Rotas de ativos
router.get('/', ativoController.list);
router.get('/:id', ativoController.getById);
router.post('/', authorize('inventario', 'ativos', 'create'), ativoController.create);
router.put('/:id', authorize('inventario', 'ativos', 'update'), ativoController.update);
router.delete('/:id', authorize('inventario', 'ativos', 'delete'), ativoController.delete);

// Movimentação
router.post('/:id/movimentar', ativoController.movimentar);
router.get('/:id/historico', ativoController.getHistorico);

// Configurações
router.get('/config/tipos', ativoController.getTipos);
router.get('/config/status', ativoController.getStatus);
router.get('/config/categorias', ativoController.getCategorias);

module.exports = router;
