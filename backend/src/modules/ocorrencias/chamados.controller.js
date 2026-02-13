const { 
  Chamado, 
  ChamadoTipo, 
  ChamadoStatus, 
  ChamadoPrioridade, 
  ChamadoHistorico,
  ChamadoComentario,
  User 
} = require('../../models');
const { Op } = require('sequelize');

class ChamadoController {
  async list(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        prioridade, 
        tipo,
        solicitante,
        tecnico,
        busca 
      } = req.query;

      const where = {};
      
      if (status) where.status_id = status;
      if (prioridade) where.prioridade_id = prioridade;
      if (tipo) where.tipo_id = tipo;
      if (solicitante) where.solicitante_id = solicitante;
      if (tecnico) where.tecnico_responsavel_id = tecnico;
      
      if (busca) {
        where[Op.or] = [
          { titulo: { [Op.iLike]: `%${busca}%` } },
          { descricao: { [Op.iLike]: `%${busca}%` } },
          { numero: { [Op.eq]: parseInt(busca) || 0 } }
        ];
      }

      // Verificar permissões
      const isAdmin = req.user.roles?.some(role => role.nivel <= 2);
      if (!isAdmin) {
        where.solicitante_id = req.user.id;
      }

      const { count, rows } = await Chamado.findAndCountAll({
        where,
        include: [
          { model: ChamadoTipo, as: 'tipo' },
          { model: ChamadoStatus, as: 'status' },
          { model: ChamadoPrioridade, as: 'prioridade' },
          { model: User, as: 'solicitante', attributes: ['id', 'nome', 'email'] },
          { model: User, as: 'tecnico_responsavel', attributes: ['id', 'nome', 'email'] }
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['created_at', 'DESC']]
      });

      res.json({
        chamados: rows,
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
      const chamado = await Chamado.findByPk(req.params.id, {
        include: [
          { model: ChamadoTipo, as: 'tipo' },
          { model: ChamadoStatus, as: 'status' },
          { model: ChamadoPrioridade, as: 'prioridade' },
          { model: User, as: 'solicitante', attributes: ['id', 'nome', 'email'] },
          { model: User, as: 'tecnico_responsavel', attributes: ['id', 'nome', 'email'] }
        ]
      });

      if (!chamado) {
        return res.status(404).json({ error: 'Chamado não encontrado' });
      }

      res.json(chamado);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const chamado = await Chamado.create({
        ...req.body,
        solicitante_id: req.user.id,
        criado_por: req.user.id
      });

      // Registrar no histórico
      await ChamadoHistorico.create({
        chamado_id: chamado.id,
        usuario_id: req.user.id,
        tipo: 'criacao',
        descricao: 'Chamado criado',
        visivel_solicitante: true
      });

      res.status(201).json(chamado);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const chamado = await Chamado.findByPk(req.params.id);
      
      if (!chamado) {
        return res.status(404).json({ error: 'Chamado não encontrado' });
      }

      await chamado.update({
        ...req.body,
        atualizado_por: req.user.id
      });

      res.json(chamado);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const chamado = await Chamado.findByPk(req.params.id);
      
      if (!chamado) {
        return res.status(404).json({ error: 'Chamado não encontrado' });
      }

      await chamado.destroy();
      res.json({ message: 'Chamado excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  async atribuir(req, res, next) {
    try {
      const { tecnico_id } = req.body;
      const chamado = await Chamado.findByPk(req.params.id);

      await chamado.update({
        tecnico_responsavel_id: tecnico_id,
        data_atribuicao: new Date()
      });

      await ChamadoHistorico.create({
        chamado_id: chamado.id,
        usuario_id: req.user.id,
        tipo: 'atribuicao',
        descricao: `Chamado atribuído`,
        valor_novo: { tecnico_id }
      });

      res.json(chamado);
    } catch (error) {
      next(error);
    }
  }

  async resolver(req, res, next) {
    try {
      const { solucao } = req.body;
      const chamado = await Chamado.findByPk(req.params.id);

      // Buscar status "resolvido"
      const statusResolvido = await ChamadoStatus.findOne({ 
        where: { tipo: 'resolvido' } 
      });

      await chamado.update({
        solucao,
        status_id: statusResolvido.id,
        data_resolucao: new Date()
      });

      await ChamadoHistorico.create({
        chamado_id: chamado.id,
        usuario_id: req.user.id,
        tipo: 'resolucao',
        descricao: 'Chamado resolvido',
        valor_novo: { solucao }
      });

      res.json(chamado);
    } catch (error) {
      next(error);
    }
  }

  async fechar(req, res, next) {
    try {
      const chamado = await Chamado.findByPk(req.params.id);
      const statusFechado = await ChamadoStatus.findOne({ 
        where: { tipo: 'fechado' } 
      });

      await chamado.update({
        status_id: statusFechado.id,
        data_fechamento: new Date()
      });

      res.json(chamado);
    } catch (error) {
      next(error);
    }
  }

  async reabrir(req, res, next) {
    try {
      const chamado = await Chamado.findByPk(req.params.id);
      const statusAberto = await ChamadoStatus.findOne({ 
        where: { tipo: 'aberto' } 
      });

      await chamado.update({
        status_id: statusAberto.id,
        data_resolucao: null,
        data_fechamento: null
      });

      res.json(chamado);
    } catch (error) {
      next(error);
    }
  }

  async comentar(req, res, next) {
    try {
      const { comentario, tipo } = req.body;
      
      const novoComentario = await ChamadoComentario.create({
        chamado_id: req.params.id,
        usuario_id: req.user.id,
        comentario,
        tipo: tipo || 'publico'
      });

      res.status(201).json(novoComentario);
    } catch (error) {
      next(error);
    }
  }

  async getHistorico(req, res, next) {
    try {
      const historico = await ChamadoHistorico.findAll({
        where: { chamado_id: req.params.id },
        include: [{ model: User, as: 'usuario', attributes: ['id', 'nome'] }],
        order: [['created_at', 'DESC']]
      });

      res.json(historico);
    } catch (error) {
      next(error);
    }
  }

  async getComentarios(req, res, next) {
    try {
      const comentarios = await ChamadoComentario.findAll({
        where: { chamado_id: req.params.id },
        include: [{ model: User, as: 'usuario', attributes: ['id', 'nome', 'avatar'] }],
        order: [['created_at', 'ASC']]
      });

      res.json(comentarios);
    } catch (error) {
      next(error);
    }
  }

  async getTipos(req, res, next) {
    try {
      const tipos = await ChamadoTipo.findAll({ where: { ativo: true } });
      res.json(tipos);
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req, res, next) {
    try {
      const status = await ChamadoStatus.findAll({ 
        where: { ativo: true },
        order: [['ordem', 'ASC']]
      });
      res.json(status);
    } catch (error) {
      next(error);
    }
  }

  async getPrioridades(req, res, next) {
    try {
      const prioridades = await ChamadoPrioridade.findAll({ 
        where: { ativo: true },
        order: [['nivel', 'ASC']]
      });
      res.json(prioridades);
    } catch (error) {
      next(error);
    }
  }

  async transferir(req, res, next) {
    try {
      const { area_id, motivo } = req.body;
      const chamado = await Chamado.findByPk(req.params.id);

      await chamado.update({
        area_id,
        tecnico_responsavel_id: null
      });

      await ChamadoHistorico.create({
        chamado_id: chamado.id,
        usuario_id: req.user.id,
        tipo: 'transferencia',
        descricao: motivo || 'Chamado transferido',
        valor_novo: { area_id }
      });

      res.json(chamado);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChamadoController();
