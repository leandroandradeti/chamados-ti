const { Ativo, AtivoTipo, AtivoStatus, AtivoHistoricoLocalizacao } = require('../../models');
const { Op } = require('sequelize');

class AtivoController {
  async list(req, res, next) {
    try {
      const { page = 1, limit = 20, tipo, status, busca } = req.query;
      
      const where = {};
      if (tipo) where.tipo_id = tipo;
      if (status) where.status_id = status;
      
      if (busca) {
        where[Op.or] = [
          { nome: { [Op.iLike]: `%${busca}%` } },
          { codigo: { [Op.iLike]: `%${busca}%` } },
          { numero_serie: { [Op.iLike]: `%${busca}%` } }
        ];
      }

      const { count, rows } = await Ativo.findAndCountAll({
        where,
        include: [
          { model: AtivoTipo, as: 'tipo' },
          { model: AtivoStatus, as: 'status' }
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['created_at', 'DESC']]
      });

      res.json({
        ativos: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const ativo = await Ativo.findByPk(req.params.id, {
        include: [
          { model: AtivoTipo, as: 'tipo' },
          { model: AtivoStatus, as: 'status' }
        ]
      });

      if (!ativo) {
        return res.status(404).json({ error: 'Ativo não encontrado' });
      }

      res.json(ativo);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const ativo = await Ativo.create({
        ...req.body,
        criado_por: req.user.id
      });

      res.status(201).json(ativo);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const ativo = await Ativo.findByPk(req.params.id);
      
      if (!ativo) {
        return res.status(404).json({ error: 'Ativo não encontrado' });
      }

      await ativo.update({
        ...req.body,
        atualizado_por: req.user.id
      });

      res.json(ativo);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const ativo = await Ativo.findByPk(req.params.id);
      
      if (!ativo) {
        return res.status(404).json({ error: 'Ativo não encontrado' });
      }

      await ativo.destroy();
      res.json({ message: 'Ativo excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  async movimentar(req, res, next) {
    try {
      const { localizacao_nova_id, responsavel_novo_id, motivo } = req.body;
      const ativo = await Ativo.findByPk(req.params.id);

      // Registrar histórico
      await AtivoHistoricoLocalizacao.create({
        ativo_id: ativo.id,
        localizacao_anterior_id: ativo.localizacao_atual_id,
        localizacao_nova_id,
        responsavel_anterior_id: ativo.responsavel_id,
        responsavel_novo_id,
        motivo,
        realizado_por_id: req.user.id
      });

      // Atualizar ativo
      await ativo.update({
        localizacao_anterior_id: ativo.localizacao_atual_id,
        localizacao_atual_id: localizacao_nova_id,
        responsavel_id: responsavel_novo_id
      });

      res.json(ativo);
    } catch (error) {
      next(error);
    }
  }

  async getHistorico(req, res, next) {
    try {
      const historico = await AtivoHistoricoLocalizacao.findAll({
        where: { ativo_id: req.params.id },
        order: [['data_movimentacao', 'DESC']]
      });

      res.json(historico);
    } catch (error) {
      next(error);
    }
  }

  async getTipos(req, res, next) {
    try {
      const tipos = await AtivoTipo.findAll({ where: { ativo: true } });
      res.json(tipos);
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req, res, next) {
    try {
      const status = await AtivoStatus.findAll({ where: { ativo: true } });
      res.json(status);
    } catch (error) {
      next(error);
    }
  }

  async getCategorias(req, res, next) {
    try {
      const { AtivoCategoria } = require('../../models/AtivoTipo');
      const categorias = await AtivoCategoria.findAll({ where: { ativo: true } });
      res.json(categorias);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AtivoController();
