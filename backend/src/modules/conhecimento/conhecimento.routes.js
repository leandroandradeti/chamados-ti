const express = require('express');
const router = express.Router();
const controller = require('./conhecimento.controller');
const { authenticate } = require('../../middlewares/auth');

// ===== CATEGORIAS =====
router.get('/categorias', authenticate, controller.listarCategorias);
router.post('/categorias', authenticate, controller.criarCategoria);
router.put('/categorias/:id', authenticate, controller.atualizarCategoria);
router.delete('/categorias/:id', authenticate, controller.deletarCategoria);

// ===== ARTIGOS =====
router.get('/artigos', authenticate, controller.listarArtigos);
router.get('/artigos/buscar', authenticate, controller.buscarArtigos);
router.get('/artigos/:id', authenticate, controller.obterArtigo);
router.post('/artigos', authenticate, controller.criarArtigo);
router.put('/artigos/:id', authenticate, controller.atualizarArtigo);
router.delete('/artigos/:id', authenticate, controller.deletarArtigo);

// Votação de utilidade
router.post('/artigos/:id/votar', authenticate, controller.votarUtilidade);

// ===== COMENTÁRIOS =====
router.post('/artigos/:id/comentarios', authenticate, controller.adicionarComentario);
router.put('/comentarios/:id/aprovar', authenticate, controller.aprovarComentario);
router.get('/comentarios/pendentes', authenticate, controller.listarComentariosPendentes);

module.exports = router;
