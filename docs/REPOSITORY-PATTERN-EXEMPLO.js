// ============================================
// REPOSITORY PATTERN - EXEMPLO DE IMPLEMENTAÇÃO
// Módulo: Chamados (completo com todas as camadas)
// ============================================

// ============================================
// 1. REPOSITORY - Camada de Acesso a Dados
// ============================================
// backend/src/modules/chamados/chamado.repository.js

const { 
  Chamado, 
  ChamadoTipo, 
  ChamadoStatus, 
  ChamadoPrioridade,
  User,
  Cliente,
  AreaAtendimento,
  ChamadoHistorico,
  ChamadoComentario,
  Tag,
  ChamadoAnexo,
  ChamadoRelacionado,
  ChamadoVinculoAtivo
} = require('../../models');
const { Op } = require('sequelize');

class ChamadoRepository {
  // Buscar por ID com todas as relações
  async findById(id, includes = []) {
    const defaultIncludes = [
      { model: ChamadoTipo, as: 'tipo' },
      { model: ChamadoStatus, as: 'status' },
      { model: ChamadoPrioridade, as: 'prioridade' },
      { model: User, as: 'solicitante', attributes: ['id', 'nome', 'email'] },
      { model: User, as: 'tecnico_responsavel', attributes: ['id', 'nome', 'email'] },
      { model: Cliente, as: 'cliente', attributes: ['id', 'nome'] },
      { model: AreaAtendimento, as: 'area', attributes: ['id', 'nome'] }
    ];

    return await Chamado.findByPk(id, {
      include: includes.length > 0 ? includes : defaultIncludes
    });
  }

  // Listar com filtros e paginação
  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 20, orderBy = 'created_at', orderDir = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    const where = this._buildWhereClause(filters);

    const { rows, count } = await Chamado.findAndCountAll({
      where,
      include: [
        { model: ChamadoTipo, as: 'tipo' },
        { model: ChamadoStatus, as: 'status' },
        { model: ChamadoPrioridade, as: 'prioridade' },
        { model: User, as: 'solicitante', attributes: ['id', 'nome'] },
        { model: User, as: 'tecnico_responsavel', attributes: ['id', 'nome'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [[orderBy, orderDir]]
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // Criar chamado
  async create(data) {
    return await Chamado.create(data);
  }

  // Atualizar chamado
  async update(id, data) {
    const chamado = await this.findById(id);
    if (!chamado) return null;
    
    return await chamado.update(data);
  }

  // Soft delete
  async delete(id) {
    const chamado = await this.findById(id);
    if (!chamado) return false;
    
    await chamado.destroy();
    return true;
  }

  // Buscar histórico
  async getHistorico(chamadoId) {
    return await ChamadoHistorico.findAll({
      where: { chamado_id: chamadoId },
      include: [
        { model: User, as: 'usuario', attributes: ['id', 'nome'] }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  // Adicionar comentário
  async addComentario(chamadoId, data) {
    return await ChamadoComentario.create({
      chamado_id: chamadoId,
      ...data
    });
  }

  // Buscar comentários
  async getComentarios(chamadoId) {
    return await ChamadoComentario.findAll({
      where: { chamado_id: chamadoId },
      include: [
        { model: User, as: 'usuario', attributes: ['id', 'nome'] }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  // Adicionar tag
  async addTag(chamadoId, tagId) {
    const chamado = await this.findById(chamadoId);
    const tag = await Tag.findByPk(tagId);
    
    if (!chamado || !tag) return false;
    
    await chamado.addTag(tag);
    return true;
  }

  // Remover tag
  async removeTag(chamadoId, tagId) {
    const chamado = await this.findById(chamadoId);
    if (!chamado) return false;
    
    await chamado.removeTag(tagId);
    return true;
  }

  // Relacionar chamados
  async relacionarChamado(chamadoOrigemId, chamadoDestinoId, tipoRelacao, descricao) {
    return await ChamadoRelacionado.create({
      chamado_origem_id: chamadoOrigemId,
      chamado_destino_id: chamadoDestinoId,
      tipo_relacao: tipoRelacao,
      descricao
    });
  }

  // Vincular ativo
  async vincularAtivo(chamadoId, ativoId, tipoVinculo, descricao) {
    return await ChamadoVinculoAtivo.create({
      chamado_id: chamadoId,
      ativo_id: ativoId,
      tipo_vinculo: tipoVinculo,
      descricao
    });
  }

  // Helper: construir WHERE clause
  _buildWhereClause(filters) {
    const where = {};

    if (filters.status_id) where.status_id = filters.status_id;
    if (filters.prioridade_id) where.prioridade_id = filters.prioridade_id;
    if (filters.tipo_id) where.tipo_id = filters.tipo_id;
    if (filters.solicitante_id) where.solicitante_id = filters.solicitante_id;
    if (filters.tecnico_responsavel_id) where.tecnico_responsavel_id = filters.tecnico_responsavel_id;
    if (filters.area_id) where.area_id = filters.area_id;
    if (filters.cliente_id) where.cliente_id = filters.cliente_id;
    if (filters.entidade_id) where.entidade_id = filters.entidade_id;

    if (filters.busca) {
      where[Op.or] = [
        { titulo: { [Op.iLike]: `%${filters.busca}%` } },
        { descricao: { [Op.iLike]: `%${filters.busca}%` } },
        { numero: { [Op.eq]: parseInt(filters.busca) || 0 } }
      ];
    }

    if (filters.data_inicio && filters.data_fim) {
      where.data_abertura = {
        [Op.between]: [filters.data_inicio, filters.data_fim]
      };
    }

    // Sempre filtrar apenas registros não deletados
    where.deleted_at = null;

    return where;
  }

  // Buscar chamados por SLA vencendo
  async findSlaVencendo(horas = 4) {
    const dataLimite = new Date();
    dataLimite.setHours(dataLimite.getHours() + horas);

    return await Chamado.findAll({
      where: {
        data_vencimento_sla: {
          [Op.between]: [new Date(), dataLimite]
        },
        status_id: {
          [Op.not]: null // Status não fechado/cancelado (ajustar conforme IDs)
        },
        deleted_at: null
      },
      include: [
        { model: ChamadoStatus, as: 'status' },
        { model: ChamadoPrioridade, as: 'prioridade' },
        { model: User, as: 'tecnico_responsavel', attributes: ['id', 'nome'] }
      ],
      order: [['data_vencimento_sla', 'ASC']]
    });
  }
}

module.exports = new ChamadoRepository();

// ============================================
// 2. SERVICE - Camada de Lógica de Negócio
// ============================================
// backend/src/modules/chamados/chamado.service.js

const chamadoRepository = require('./chamado.repository');
const { ChamadoHistorico, SlaEvento } = require('../../models');
const emailService = require('../../services/email.service');
const slaCalculator = require('../../utils/slaCalculator');

class ChamadoService {
  // Criar chamado completo
  async criarChamado(data, usuarioId) {
    // Validar dados (pode usar DTO)
    this._validateChamadoData(data);

    // Gerar número sequencial
    const numero = await this._gerarNumero();

    // Calcular SLA
    const slaData = await slaCalculator.calcular(data.tipo_id, data.prioridade_id);

    // Criar chamado
    const chamado = await chamadoRepository.create({
      ...data,
      numero,
      data_abertura: new Date(),
      data_vencimento_sla: slaData.data_vencimento,
      solicitante_id: usuarioId
    });

    // Registrar no histórico
    await this._registrarHistorico(chamado.id, usuarioId, 'CRIADO', 'Chamado criado');

    // Criar evento de SLA
    await this._criarEventoSla(chamado.id, slaData);

    // Adicionar tags (se fornecidas)
    if (data.tags && data.tags.length > 0) {
      for (const tagId of data.tags) {
        await chamadoRepository.addTag(chamado.id, tagId);
      }
    }

    // Vincular ativos (se fornecidos)
    if (data.ativos && data.ativos.length > 0) {
      for (const ativo of data.ativos) {
        await chamadoRepository.vincularAtivo(chamado.id, ativo.id, ativo.tipo_vinculo, ativo.descricao);
      }
    }

    // Aplicar distribuição automática
    await this._aplicarDistribuicaoAutomatica(chamado.id);

    // Enviar notificação
    await this._notificarCriacao(chamado.id);

    return await chamadoRepository.findById(chamado.id);
  }

  // Atribuir técnico
  async atribuir(chamadoId, tecnicoId, usuarioId) {
    const chamado = await chamadoRepository.findById(chamadoId);
    if (!chamado) throw new Error('Chamado não encontrado');

    // Atualizar chamado
    await chamadoRepository.update(chamadoId, {
      tecnico_responsavel_id: tecnicoId,
      atualizado_por: usuarioId
    });

    // Registrar histórico
    await this._registrarHistorico(
      chamadoId, 
      usuarioId, 
      'ATRIBUIDO', 
      `Chamado atribuído ao técnico ${tecnicoId}`
    );

    // Notificar técnico
    await emailService.notificarAtribuicao(tecnicoId, chamadoId);

    return await chamadoRepository.findById(chamadoId);
  }

  // Resolver chamado
  async resolver(chamadoId, solucao, usuarioId) {
    const chamado = await chamadoRepository.findById(chamadoId);
    if (!chamado) throw new Error('Chamado não encontrado');

    const statusResolvido = await this._getStatusByTipo('resolvido');

    // Calcular tempo de resolução
    const tempoResolucao = Math.floor((new Date() - chamado.data_abertura) / 1000 / 60); // minutos

    // Atualizar chamado
    await chamadoRepository.update(chamadoId, {
      status_id: statusResolvido.id,
      data_resolucao: new Date(),
      tempo_resolucao: tempoResolucao,
      atualizado_por: usuarioId
    });

    // Adicionar comentário com solução
    await chamadoRepository.addComentario(chamadoId, {
      usuario_id: usuarioId,
      comentario: solucao,
      interno: false
    });

    // Registrar histórico
    await this._registrarHistorico(chamadoId, usuarioId, 'RESOLVIDO', 'Chamado resolvido');

    // Registrar evento de SLA
    await this._registrarEventoSla(chamadoId, 'resolucao');

    // Notificar solicitante
    await emailService.notificarResolucao(chamado.solicitante_id, chamadoId);

    return await chamadoRepository.findById(chamadoId);
  }

  // Fechar chamado
  async fechar(chamadoId, observacoes, usuarioId) {
    const chamado = await chamadoRepository.findById(chamadoId);
    if (!chamado) throw new Error('Chamado não encontrado');

    const statusFechado = await this._getStatusByTipo('fechado');

    await chamadoRepository.update(chamadoId, {
      status_id: statusFechado.id,
      data_fechamento: new Date(),
      atualizado_por: usuarioId
    });

    if (observacoes) {
      await chamadoRepository.addComentario(chamadoId, {
        usuario_id: usuarioId,
        comentario: observacoes,
        interno: true
      });
    }

    await this._registrarHistorico(chamadoId, usuarioId, 'FECHADO', 'Chamado fechado');
    await this._registrarEventoSla(chamadoId, 'fechamento');

    return await chamadoRepository.findById(chamadoId);
  }

  // Reabrir chamado
  async reabrir(chamadoId, motivo, usuarioId) {
    const chamado = await chamadoRepository.findById(chamadoId);
    if (!chamado) throw new Error('Chamado não encontrado');

    const statusAberto = await this._getStatusByTipo('aberto');

    // Recalcular SLA
    const slaData = await slaCalculator.recalcular(chamado);

    await chamadoRepository.update(chamadoId, {
      status_id: statusAberto.id,
      data_vencimento_sla: slaData.data_vencimento,
      data_resolucao: null,
      data_fechamento: null,
      atualizado_por: usuarioId
    });

    await chamadoRepository.addComentario(chamadoId, {
      usuario_id: usuarioId,
      comentario: `Chamado reaberto. Motivo: ${motivo}`,
      interno: false
    });

    await this._registrarHistorico(chamadoId, usuarioId, 'REABERTO', motivo);

    return await chamadoRepository.findById(chamadoId);
  }

  // Transferir para outra área
  async transferir(chamadoId, novaAreaId, motivo, usuarioId) {
    const chamado = await chamadoRepository.findById(chamadoId);
    if (!chamado) throw new Error('Chamado não encontrado');

    await chamadoRepository.update(chamadoId, {
      area_id: novaAreaId,
      tecnico_responsavel_id: null, // Remove técnico ao transferir
      atualizado_por: usuarioId
    });

    await chamadoRepository.addComentario(chamadoId, {
      usuario_id: usuarioId,
      comentario: `Transferido para nova área. Motivo: ${motivo}`,
      interno: true
    });

    await this._registrarHistorico(chamadoId, usuarioId, 'TRANSFERIDO', motivo);

    return await chamadoRepository.findById(chamadoId);
  }

  // Listar com filtros
  async listar(filters, pagination, usuarioId, userRoles) {
    // Aplicar filtro de entidade (multi-tenant)
    if (!this._isAdmin(userRoles)) {
      filters.entidade_id = await this._getUserEntidade(usuarioId);
    }

    // Aplicar filtro de permissão (usuário vê apenas seus chamados)
    if (!this._canViewAll(userRoles)) {
      filters.solicitante_id = usuarioId;
    }

    return await chamadoRepository.findAll(filters, pagination);
  }

  // Helpers privados
  async _gerarNumero() {
    // Implemente lógica de geração de número sequencial
    // Exemplo simples (pode usar sequence no banco)
    const ultimoChamado = await Chamado.findOne({
      order: [['numero', 'DESC']]
    });
    return ultimoChamado ? ultimoChamado.numero + 1 : 1;
  }

  async _registrarHistorico(chamadoId, usuarioId, acao, descricao) {
    return await ChamadoHistorico.create({
      chamado_id: chamadoId,
      usuario_id: usuarioId,
      acao,
      descricao
    });
  }

  async _criarEventoSla(chamadoId, slaData) {
    return await SlaEvento.create({
      chamado_id: chamadoId,
      sla_id: slaData.sla_id,
      tipo_evento: 'resposta',
      status: 'ativo',
      tempo_previsto: slaData.data_vencimento
    });
  }

  async _registrarEventoSla(chamadoId, tipoEvento) {
    // Buscar evento ativo
    const evento = await SlaEvento.findOne({
      where: { chamado_id: chamadoId, tipo_evento: tipoEvento, status: 'ativo' }
    });

    if (evento) {
      const agora = new Date();
      const cumprido = agora <= evento.tempo_previsto;
      
      await evento.update({
        status: cumprido ? 'cumprido' : 'violado',
        tempo_real: agora
      });
    }
  }

  async _aplicarDistribuicaoAutomatica(chamadoId) {
    // Implementar lógica de distribuição automática baseada em regras
    // (buscar de DistribuicaoAutomatica e aplicar)
  }

  async _notificarCriacao(chamadoId) {
    // Enviar emails/notificações
  }

  async _getStatusByTipo(tipo) {
    const { ChamadoStatus } = require('../../models');
    return await ChamadoStatus.findOne({ where: { tipo } });
  }

  _validateChamadoData(data) {
    if (!data.titulo) throw new Error('Título é obrigatório');
    if (!data.tipo_id) throw new Error('Tipo é obrigatório');
    if (!data.prioridade_id) throw new Error('Prioridade é obrigatória');
  }

  _isAdmin(roles) {
    return roles.some(r => r.nivel <= 2);
  }

  _canViewAll(roles) {
    return roles.some(r => r.nivel <= 3);
  }

  async _getUserEntidade(usuarioId) {
    const user = await User.findByPk(usuarioId);
    return user.entidade_id;
  }
}

module.exports = new ChamadoService();

// ============================================
// 3. CONTROLLER - Camada de Apresentação
// ============================================
// backend/src/modules/chamados/chamado.controller.js

const chamadoService = require('./chamado.service');
const { validationResult } = require('express-validator');

class ChamadoController {
  // Listar chamados
  async list(req, res, next) {
    try {
      const filters = {
        status_id: req.query.status,
        prioridade_id: req.query.prioridade,
        tipo_id: req.query.tipo,
        busca: req.query.busca
      };

      const pagination = {
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        orderBy: req.query.orderBy || 'created_at',
        orderDir: req.query.orderDir || 'DESC'
      };

      const result = await chamadoService.listar(
        filters, 
        pagination, 
        req.user.id, 
        req.user.roles
      );

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter por ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const chamado = await chamadoRepository.findById(id);

      if (!chamado) {
        return res.status(404).json({
          success: false,
          message: 'Chamado não encontrado'
        });
      }

      res.json({
        success: true,
        data: chamado
      });
    } catch (error) {
      next(error);
    }
  }

  // Criar chamado
  async create(req, res, next) {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const chamado = await chamadoService.criarChamado(req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Chamado criado com sucesso',
        data: chamado
      });
    } catch (error) {
      next(error);
    }
  }

  // Atribuir técnico
  async atribuir(req, res, next) {
    try {
      const { id } = req.params;
      const { tecnico_id } = req.body;

      const chamado = await chamadoService.atribuir(id, tecnico_id, req.user.id);

      res.json({
        success: true,
        message: 'Chamado atribuído com sucesso',
        data: chamado
      });
    } catch (error) {
      next(error);
    }
  }

  // Resolver
  async resolver(req, res, next) {
    try {
      const { id } = req.params;
      const { solucao } = req.body;

      const chamado = await chamadoService.resolver(id, solucao, req.user.id);

      res.json({
        success: true,
        message: 'Chamado resolvido com sucesso',
        data: chamado
      });
    } catch (error) {
      next(error);
    }
  }

  // Fechar
  async fechar(req, res, next) {
    try {
      const { id } = req.params;
      const { observacoes } = req.body;

      const chamado = await chamadoService.fechar(id, observacoes, req.user.id);

      res.json({
        success: true,
        message: 'Chamado fechado com sucesso',
        data: chamado
      });
    } catch (error) {
      next(error);
    }
  }

  // Reabrir
  async reabrir(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const chamado = await chamadoService.reabrir(id, motivo, req.user.id);

      res.json({
        success: true,
        message: 'Chamado reaberto com sucesso',
        data: chamado
      });
    } catch (error) {
      next(error);
    }
  }

  // Transferir
  async transferir(req, res, next) {
    try {
      const { id } = req.params;
      const { area_id, motivo } = req.body;

      const chamado = await chamadoService.transferir(id, area_id, motivo, req.user.id);

      res.json({
        success: true,
        message: 'Chamado transferido com sucesso',
        data: chamado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChamadoController();

// ============================================
// 4. VALIDATOR - Validação de Dados
// ============================================
// backend/src/modules/chamados/chamado.validator.js

const { body, param, query } = require('express-validator');

const chamadoValidator = {
  // Validação para criar chamado
  create: [
    body('titulo')
      .notEmpty().withMessage('Título é obrigatório')
      .isLength({ min: 5, max: 255 }).withMessage('Título deve ter entre 5 e 255 caracteres'),
    
    body('descricao')
      .notEmpty().withMessage('Descrição é obrigatória')
      .isLength({ min: 10 }).withMessage('Descrição deve ter no mínimo 10 caracteres'),
    
    body('tipo_id')
      .notEmpty().withMessage('Tipo é obrigatório')
      .isUUID().withMessage('Tipo deve ser um UUID válido'),
    
    body('prioridade_id')
      .notEmpty().withMessage('Prioridade é obrigatória')
      .isUUID().withMessage('Prioridade deve ser um UUID válido'),
    
    body('cliente_id')
      .optional()
      .isUUID().withMessage('Cliente deve ser um UUID válido'),
    
    body('tags')
      .optional()
      .isArray().withMessage('Tags deve ser um array'),
    
    body('ativos')
      .optional()
      .isArray().withMessage('Ativos deve ser um array')
  ],

  // Validação para atribuir
  atribuir: [
    param('id').isUUID().withMessage('ID do chamado inválido'),
    body('tecnico_id').notEmpty().isUUID().withMessage('ID do técnico inválido')
  ],

  // Validação para resolver
  resolver: [
    param('id').isUUID().withMessage('ID do chamado inválido'),
    body('solucao').notEmpty().isLength({ min: 10 }).withMessage('Solução deve ter no mínimo 10 caracteres')
  ],

  // Validação para transferir
  transferir: [
    param('id').isUUID().withMessage('ID do chamado inválido'),
    body('area_id').notEmpty().isUUID().withMessage('ID da área inválido'),
    body('motivo').notEmpty().isLength({ min: 5 }).withMessage('Motivo deve ter no mínimo 5 caracteres')
  ]
};

module.exports = chamadoValidator;

// ============================================
// 5. ROUTES - Definição de Rotas
// ============================================
// backend/src/modules/chamados/chamado.routes.js

const express = require('express');
const router = express.Router();
const controller = require('./chamado.controller');
const validator = require('./chamado.validator');
const { authenticate, authorize } = require('../../middlewares/auth');

// Middleware de autenticação em todas as rotas
router.use(authenticate);

// Rotas CRUD
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', validator.create, controller.create);

// Ações no chamado
router.post('/:id/atribuir', validator.atribuir, controller.atribuir);
router.post('/:id/resolver', validator.resolver, controller.resolver);
router.post('/:id/fechar', controller.fechar);
router.post('/:id/reabrir', controller.reabrir);
router.post('/:id/transferir', validator.transferir, controller.transferir);

module.exports = router;

// ============================================
// 6. DTO - Data Transfer Objects
// ============================================
// backend/src/modules/chamados/dtos/create-chamado.dto.js

class CreateChamadoDTO {
  constructor(data) {
    this.titulo = data.titulo;
    this.descricao = data.descricao;
    this.tipo_id = data.tipo_id;
    this.prioridade_id = data.prioridade_id;
    this.area_id = data.area_id;
    this.cliente_id = data.cliente_id;
    this.unidade_id = data.unidade_id;
    this.departamento_id = data.departamento_id;
    this.tags = data.tags || [];
    this.ativos = data.ativos || [];
    this.campos_customizados = data.campos_customizados || {};
  }

  // Validação adicional
  validate() {
    const errors = [];

    if (!this.titulo || this.titulo.trim().length < 5) {
      errors.push('Título deve ter no mínimo 5 caracteres');
    }

    if (!this.descricao || this.descricao.trim().length < 10) {
      errors.push('Descrição deve ter no mínimo 10 caracteres');
    }

    return errors;
  }

  // Sanitização
  sanitize() {
    this.titulo = this.titulo.trim();
    this.descricao = this.descricao.trim();
    return this;
  }
}

module.exports = CreateChamadoDTO;

// ============================================
// USO DO REPOSITORY PATTERN
// ============================================

/*
VANTAGENS:

1. SEPARAÇÃO DE RESPONSABILIDADES
   - Repository: Acesso a dados
   - Service: Lógica de negócio
   - Controller: HTTP/API
   - Validator: Validação de entrada

2. TESTABILIDADE
   - Cada camada pode ser testada isoladamente
   - Fácil criar mocks dos repositories

3. MANUTENIBILIDADE
   - Mudanças no banco não afetam lógica de negócio
   - Código mais organizado e legível

4. REUTILIZAÇÃO
   - Métodos do repository podem ser usados em vários services
   - Lógica de negócio concentrada no service

5. ESCALABILIDADE
   - Fácil adicionar cache
   - Fácil trocar ORM
   - Fácil adicionar novos recursos

ESTRUTURA FINAL:
/backend/src/modules/chamados/
├── chamado.repository.js  ✅ Acesso a dados
├── chamado.service.js     ✅ Lógica de negócio
├── chamado.controller.js  ✅ Controle HTTP
├── chamado.validator.js   ✅ Validações
├── chamado.routes.js      ✅ Rotas
└── dtos/
    ├── create-chamado.dto.js
    ├── update-chamado.dto.js
    └── chamado-response.dto.js

PRÓXIMOS PASSOS:
- Aplicar este padrão para todos os módulos
- Adicionar testes unitários
- Adicionar documentação Swagger
- Implementar cache com Redis
*/
