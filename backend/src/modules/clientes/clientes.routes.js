const express = require('express');
const router = express.Router();
const { Cliente, Unidade, Departamento } = require('../../models');
const { authorize } = require('../../middlewares/auth');

// Clientes
router.get('/', async (req, res, next) => {
  try {
    const clientes = await Cliente.findAll({
      where: { ativo: true },
      order: [['nome', 'ASC']]
    });
    res.json(clientes);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      include: [{ model: Unidade, as: 'unidades' }]
    });
    res.json(cliente);
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('clientes', 'clientes', 'create'), async (req, res, next) => {
  try {
    const cliente = await Cliente.create({
      ...req.body,
      criado_por: req.user.id
    });
    res.status(201).json(cliente);
  } catch (error) {
    next(error);
  }
});

// Unidades
router.get('/:clienteId/unidades', async (req, res, next) => {
  try {
    const unidades = await Unidade.findAll({
      where: { cliente_id: req.params.clienteId, ativo: true }
    });
    res.json(unidades);
  } catch (error) {
    next(error);
  }
});

// Departamentos
router.get('/unidades/:unidadeId/departamentos', async (req, res, next) => {
  try {
    const departamentos = await Departamento.findAll({
      where: { unidade_id: req.params.unidadeId, ativo: true }
    });
    res.json(departamentos);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
