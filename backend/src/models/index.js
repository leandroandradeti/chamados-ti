const { sequelize } = require('../config/database');

// Importar todos os modelos
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const { UserRole, RolePermission } = require('./UserRole');
const Chamado = require('./Chamado');
const ChamadoTipo = require('./ChamadoTipo');
const ChamadoStatus = require('./ChamadoStatus');
const ChamadoPrioridade = require('./ChamadoPrioridade');
const SLA = require('./SLA');
const ChamadoHistorico = require('./ChamadoHistorico');
const ChamadoComentario = require('./ChamadoComentario');
const Ativo = require('./Ativo');
const { AtivoTipo, AtivoModelo, AtivoCategoria, AtivoStatus } = require('./AtivoTipo');
const AtivoHistoricoLocalizacao = require('./AtivoHistoricoLocalizacao');
const { Software, Licenca, TipoLicenca, SoftwareCategoria } = require('./Software');
const { Cliente, ClienteTipo, ClienteStatus } = require('./Cliente');
const { Unidade, Departamento, CentroCusto } = require('./Unidade');
const { AreaAtendimento, PerfilJornada, Feriado, CampoCustomizado, LogSistema } = require('./Admin');

// === RELACIONAMENTOS ===

// User <-> Role (muitos para muitos)
User.belongsToMany(Role, { through: UserRole, as: 'roles', foreignKey: 'user_id' });
Role.belongsToMany(User, { through: UserRole, as: 'users', foreignKey: 'role_id' });

// Role <-> Permission (muitos para muitos)
Role.belongsToMany(Permission, { through: RolePermission, as: 'permissions', foreignKey: 'role_id' });
Permission.belongsToMany(Role, { through: RolePermission, as: 'roles', foreignKey: 'permission_id' });

// Chamado relacionamentos
Chamado.belongsTo(ChamadoTipo, { as: 'tipo', foreignKey: 'tipo_id' });
Chamado.belongsTo(ChamadoStatus, { as: 'status', foreignKey: 'status_id' });
Chamado.belongsTo(ChamadoPrioridade, { as: 'prioridade', foreignKey: 'prioridade_id' });
Chamado.belongsTo(SLA, { as: 'sla', foreignKey: 'sla_id' });
Chamado.belongsTo(AreaAtendimento, { as: 'area', foreignKey: 'area_id' });
Chamado.belongsTo(User, { as: 'solicitante', foreignKey: 'solicitante_id' });
Chamado.belongsTo(User, { as: 'tecnico_responsavel', foreignKey: 'tecnico_responsavel_id' });
Chamado.belongsTo(Cliente, { as: 'cliente', foreignKey: 'cliente_id' });
Chamado.belongsTo(Unidade, { as: 'unidade', foreignKey: 'unidade_id' });
Chamado.belongsTo(Departamento, { as: 'departamento', foreignKey: 'departamento_id' });

// Chamado Histórico
ChamadoHistorico.belongsTo(Chamado, { as: 'chamado', foreignKey: 'chamado_id' });
ChamadoHistorico.belongsTo(User, { as: 'usuario', foreignKey: 'usuario_id' });
Chamado.hasMany(ChamadoHistorico, { as: 'historico', foreignKey: 'chamado_id' });

// Chamado Comentários
ChamadoComentario.belongsTo(Chamado, { as: 'chamado', foreignKey: 'chamado_id' });
ChamadoComentario.belongsTo(User, { as: 'usuario', foreignKey: 'usuario_id' });
Chamado.hasMany(ChamadoComentario, { as: 'comentarios', foreignKey: 'chamado_id' });

// ChamadoTipo relacionamentos
ChamadoTipo.belongsTo(SLA, { as: 'sla_padrao', foreignKey: 'sla_padrao_id' });
ChamadoTipo.belongsTo(AreaAtendimento, { as: 'area_padrao', foreignKey: 'area_padrao_id' });

// SLA relacionamentos
SLA.belongsTo(PerfilJornada, { as: 'perfil_jornada', foreignKey: 'perfil_jornada_id' });

// Ativo relacionamentos
Ativo.belongsTo(AtivoTipo, { as: 'tipo', foreignKey: 'tipo_id' });
Ativo.belongsTo(AtivoModelo, { as: 'modelo', foreignKey: 'modelo_id' });
Ativo.belongsTo(AtivoCategoria, { as: 'categoria', foreignKey: 'categoria_id' });
Ativo.belongsTo(AtivoStatus, { as: 'status', foreignKey: 'status_id' });
Ativo.belongsTo(Unidade, { as: 'localizacao_atual', foreignKey: 'localizacao_atual_id' });
Ativo.belongsTo(Unidade, { as: 'localizacao_anterior', foreignKey: 'localizacao_anterior_id' });
Ativo.belongsTo(User, { as: 'responsavel', foreignKey: 'responsavel_id' });
Ativo.belongsTo(Cliente, { as: 'cliente', foreignKey: 'cliente_id' });
Ativo.belongsTo(Departamento, { as: 'departamento', foreignKey: 'departamento_id' });

// AtivoModelo relacionamentos
AtivoModelo.belongsTo(AtivoTipo, { as: 'tipo', foreignKey: 'tipo_id' });

// AtivoCategoria (auto-relacionamento para hierarquia)
AtivoCategoria.belongsTo(AtivoCategoria, { as: 'pai', foreignKey: 'pai_id' });
AtivoCategoria.hasMany(AtivoCategoria, { as: 'filhos', foreignKey: 'pai_id' });

// AtivoHistoricoLocalizacao
AtivoHistoricoLocalizacao.belongsTo(Ativo, { as: 'ativo', foreignKey: 'ativo_id' });
AtivoHistoricoLocalizacao.belongsTo(Unidade, { as: 'localizacao_anterior', foreignKey: 'localizacao_anterior_id' });
AtivoHistoricoLocalizacao.belongsTo(Unidade, { as: 'localizacao_nova', foreignKey: 'localizacao_nova_id' });
AtivoHistoricoLocalizacao.belongsTo(User, { as: 'responsavel_anterior', foreignKey: 'responsavel_anterior_id' });
AtivoHistoricoLocalizacao.belongsTo(User, { as: 'responsavel_novo', foreignKey: 'responsavel_novo_id' });
AtivoHistoricoLocalizacao.belongsTo(User, { as: 'realizado_por', foreignKey: 'realizado_por_id' });
Ativo.hasMany(AtivoHistoricoLocalizacao, { as: 'historico_localizacao', foreignKey: 'ativo_id' });

// Software e Licenças
Software.belongsTo(SoftwareCategoria, { as: 'categoria', foreignKey: 'categoria_id' });
Software.belongsTo(TipoLicenca, { as: 'tipo_licenca', foreignKey: 'tipo_licenca_id' });
Licenca.belongsTo(Software, { as: 'software', foreignKey: 'software_id' });
Licenca.belongsTo(TipoLicenca, { as: 'tipo_licenca', foreignKey: 'tipo_licenca_id' });
Software.hasMany(Licenca, { as: 'licencas', foreignKey: 'software_id' });

// Cliente relacionamentos
Cliente.belongsTo(ClienteTipo, { as: 'tipo', foreignKey: 'tipo_id' });
Cliente.belongsTo(ClienteStatus, { as: 'status', foreignKey: 'status_id' });
Cliente.hasMany(Unidade, { as: 'unidades', foreignKey: 'cliente_id' });

// Unidade relacionamentos
Unidade.belongsTo(Cliente, { as: 'cliente', foreignKey: 'cliente_id' });
Unidade.belongsTo(User, { as: 'responsavel', foreignKey: 'responsavel_id' });
Unidade.hasMany(Departamento, { as: 'departamentos', foreignKey: 'unidade_id' });

// Departamento relacionamentos
Departamento.belongsTo(Unidade, { as: 'unidade', foreignKey: 'unidade_id' });
Departamento.belongsTo(User, { as: 'responsavel', foreignKey: 'responsavel_id' });
Departamento.hasMany(CentroCusto, { as: 'centros_custo', foreignKey: 'departamento_id' });

// CentroCusto relacionamentos
CentroCusto.belongsTo(Departamento, { as: 'departamento', foreignKey: 'departamento_id' });

// LogSistema
LogSistema.belongsTo(User, { as: 'usuario', foreignKey: 'usuario_id' });

// Exportar todos os modelos
module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Chamado,
  ChamadoTipo,
  ChamadoStatus,
  ChamadoPrioridade,
  SLA,
  ChamadoHistorico,
  ChamadoComentario,
  Ativo,
  AtivoTipo,
  AtivoModelo,
  AtivoCategoria,
  AtivoStatus,
  AtivoHistoricoLocalizacao,
  Software,
  Licenca,
  TipoLicenca,
  SoftwareCategoria,
  Cliente,
  ClienteTipo,
  ClienteStatus,
  Unidade,
  Departamento,
  CentroCusto,
  AreaAtendimento,
  PerfilJornada,
  Feriado,
  CampoCustomizado,
  LogSistema
};
