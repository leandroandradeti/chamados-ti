const express = require('express');
const { Op } = require('sequelize');
const { AreaAtendimento } = require('../../models');
const { isGlobalAdmin } = require('../../middlewares/auth');
const { auditLog } = require('../../utils/audit');

const router = express.Router();

const canWriteAreas = (req) => {
  if (process.env.MULTIEMPRESA !== 'true') {
    return true;
  }

  return isGlobalAdmin(req.user);
};

const normalizeNome = (value) => String(value || '').trim();

router.get('/', async (req, res, next) => {
  try {
    const { ativo = 'true', busca } = req.query;

    const where = {};

    if (ativo === 'true') where.ativo = true;
    if (ativo === 'false') where.ativo = false;

    if (busca) {
      where[Op.or] = [
        { nome: { [Op.iLike]: `%${busca}%` } },
        { descricao: { [Op.iLike]: `%${busca}%` } },
        { email: { [Op.iLike]: `%${busca}%` } }
      ];
    }

    const areas = await AreaAtendimento.findAll({
      where,
      order: [['nome', 'ASC']]
    });

    res.json(areas);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!canWriteAreas(req)) {
      return res.status(403).json({ error: 'Apenas administrador global pode criar áreas em ambiente multi-tenant' });
    }

    const nome = normalizeNome(req.body.nome);
    const email = req.body.email ? String(req.body.email).trim() : null;

    if (!nome) {
      return res.status(400).json({ error: 'Campo nome é obrigatório' });
    }

    const existente = await AreaAtendimento.findOne({
      where: {
        nome: { [Op.iLike]: nome }
      }
    });

    if (existente) {
      return res.status(409).json({ error: 'Já existe uma área com este nome' });
    }

    const area = await AreaAtendimento.create({
      nome,
      descricao: req.body.descricao || null,
      email,
      ativo: req.body.ativo ?? true
    });

    await auditLog(req, {
      modulo: 'admin',
      acao: 'create',
      entidade: 'area_atendimento',
      entidadeId: area.id,
      descricao: `Área criada: ${area.nome}`,
      dadosDepois: area.toJSON()
    });

    res.status(201).json(area);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!canWriteAreas(req)) {
      return res.status(403).json({ error: 'Apenas administrador global pode atualizar áreas em ambiente multi-tenant' });
    }

    const area = await AreaAtendimento.findByPk(req.params.id);

    if (!area) {
      return res.status(404).json({ error: 'Área não encontrada' });
    }

    const nome = req.body.nome !== undefined ? normalizeNome(req.body.nome) : area.nome;
    if (!nome) {
      return res.status(400).json({ error: 'Campo nome é obrigatório' });
    }

    const conflito = await AreaAtendimento.findOne({
      where: {
        id: { [Op.ne]: area.id },
        nome: { [Op.iLike]: nome }
      }
    });

    if (conflito) {
      return res.status(409).json({ error: 'Já existe uma área com este nome' });
    }

    const dadosAntes = area.toJSON();

    await area.update({
      nome,
      descricao: req.body.descricao !== undefined ? req.body.descricao : area.descricao,
      email: req.body.email !== undefined ? (req.body.email ? String(req.body.email).trim() : null) : area.email,
      ativo: req.body.ativo !== undefined ? Boolean(req.body.ativo) : area.ativo
    });

    await auditLog(req, {
      modulo: 'admin',
      acao: 'update',
      entidade: 'area_atendimento',
      entidadeId: area.id,
      descricao: `Área atualizada: ${area.nome}`,
      dadosAntes,
      dadosDepois: area.toJSON()
    });

    res.json(area);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!canWriteAreas(req)) {
      return res.status(403).json({ error: 'Apenas administrador global pode inativar áreas em ambiente multi-tenant' });
    }

    const area = await AreaAtendimento.findByPk(req.params.id);

    if (!area) {
      return res.status(404).json({ error: 'Área não encontrada' });
    }

    if (!area.ativo) {
      return res.status(409).json({ error: 'Área já está inativa' });
    }

    const dadosAntes = area.toJSON();
    await area.update({ ativo: false });

    await auditLog(req, {
      modulo: 'admin',
      acao: 'inactivate',
      entidade: 'area_atendimento',
      entidadeId: area.id,
      descricao: `Área inativada: ${area.nome}`,
      dadosAntes,
      dadosDepois: area.toJSON()
    });

    res.json({ message: 'Área inativada com sucesso' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
