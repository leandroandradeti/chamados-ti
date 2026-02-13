const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Chamado, Ativo } = require('../../models');

// Middleware para autenticar via API Token
const authenticateApiToken = (req, res, next) => {
  const apiToken = req.headers['x-api-token'];
  
  if (!apiToken) {
    return res.status(401).json({ error: 'API Token não fornecido' });
  }

  try {
    // Validar token (você pode implementar uma tabela de tokens de API)
    const decoded = jwt.verify(apiToken, process.env.JWT_SECRET);
    req.apiClient = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'API Token inválido' });
  }
};

router.use(authenticateApiToken);

// Criar chamado via API externa
router.post('/chamados', async (req, res, next) => {
  try {
    const chamado = await Chamado.create({
      ...req.body,
      origem: 'api'
    });

    res.status(201).json({
      success: true,
      chamado: {
        id: chamado.id,
        numero: chamado.numero
      }
    });
  } catch (error) {
    next(error);
  }
});

// Consultar status de chamado
router.get('/chamados/:numero', async (req, res, next) => {
  try {
    const chamado = await Chamado.findOne({
      where: { numero: req.params.numero }
    });

    if (!chamado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    res.json({
      numero: chamado.numero,
      titulo: chamado.titulo,
      status: chamado.status,
      criado_em: chamado.created_at
    });
  } catch (error) {
    next(error);
  }
});

// Buscar ativos
router.get('/ativos', async (req, res, next) => {
  try {
    const { codigo, numero_serie } = req.query;
    const where = {};
    
    if (codigo) where.codigo = codigo;
    if (numero_serie) where.numero_serie = numero_serie;

    const ativos = await Ativo.findAll({ where, limit: 10 });
    res.json(ativos);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
