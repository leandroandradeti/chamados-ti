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
const { Tag, ChamadoTag, ChamadoAnexo } = require('./Tag');
const { SolucaoPadrao, RoteiroAtendimento, RoteiroPasso, RoteiroExecucao } = require('./Solucao');
const { Fabricante, Fornecedor, TermoResponsabilidade } = require('./Fabricante');
const ValorCustomizado = require('./ValorCustomizado');
const { ConhecimentoCategoria, ConhecimentoArtigo, ConhecimentoComentario } = require('./Conhecimento');
const { GrupoTecnico, GrupoTecnicoUsuario } = require('./GrupoTecnico');
const Entidade = require('./Entidade');
const { Session, LogAcesso, EmpresaConfiguracao } = require('./Session');
const { ChamadoRelacionado, ChamadoVinculoAtivo, ChamadoChecklist, ChamadoChecklistExecucao, DistribuicaoAutomatica, FilaChamado } = require('./ChamadoRelacionado');
const { SlaRegra, SlaEvento, CalendarioSla } = require('./SlaRegra');
const { Servico, RelacionamentoAtivo, DependenciaServico } = require('./Servico');
const { AtivoGarantia, LicencaAtribuicao, InstalacaoSoftware } = require('./AtivoGarantia');
const { CampoCustomizadoOpcao, ConfiguracaoSistema, EmailSmtp, EmailTemplate, ListaDistribuicao } = require('./Configuracao');

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

// Tags e Chamado (muitos para muitos)
Chamado.belongsToMany(Tag, { through: ChamadoTag, as: 'tags', foreignKey: 'chamado_id' });
Tag.belongsToMany(Chamado, { through: ChamadoTag, as: 'chamados', foreignKey: 'tag_id' });

// Chamado Anexos
ChamadoAnexo.belongsTo(Chamado, { as: 'chamado', foreignKey: 'chamado_id' });
ChamadoAnexo.belongsTo(User, { as: 'usuario', foreignKey: 'usuario_id' });
Chamado.hasMany(ChamadoAnexo, { as: 'anexos', foreignKey: 'chamado_id' });

// Soluções Padrão
SolucaoPadrao.belongsTo(ChamadoTipo, { as: 'tipo', foreignKey: 'tipo_id' });
SolucaoPadrao.belongsTo(User, { as: 'criador', foreignKey: 'criado_por' });

// Roteiros de Atendimento
RoteiroAtendimento.belongsTo(ChamadoTipo, { as: 'tipo', foreignKey: 'tipo_id' });
RoteiroAtendimento.hasMany(RoteiroPasso, { as: 'passos', foreignKey: 'roteiro_id' });
RoteiroPasso.belongsTo(RoteiroAtendimento, { as: 'roteiro', foreignKey: 'roteiro_id' });

// Execução de Roteiros
RoteiroExecucao.belongsTo(Chamado, { as: 'chamado', foreignKey: 'chamado_id' });
RoteiroExecucao.belongsTo(RoteiroAtendimento, { as: 'roteiro', foreignKey: 'roteiro_id' });
RoteiroExecucao.belongsTo(RoteiroPasso, { as: 'passo', foreignKey: 'passo_id' });
RoteiroExecucao.belongsTo(User, { as: 'usuario', foreignKey: 'usuario_id' });
Chamado.hasMany(RoteiroExecucao, { as: 'execucoes_roteiro', foreignKey: 'chamado_id' });

// Termo de Responsabilidade
TermoResponsabilidade.belongsTo(Ativo, { as: 'ativo_relacionado', foreignKey: 'ativo_id' });
TermoResponsabilidade.belongsTo(User, { as: 'usuario', foreignKey: 'usuario_id' });
Ativo.hasMany(TermoResponsabilidade, { as: 'termos', foreignKey: 'ativo_id' });

// Valores Customizados
ValorCustomizado.belongsTo(CampoCustomizado, { as: 'campo', foreignKey: 'campo_id' });

// Base de Conhecimento
ConhecimentoCategoria.belongsTo(ConhecimentoCategoria, { as: 'pai', foreignKey: 'pai_id' });
ConhecimentoCategoria.hasMany(ConhecimentoCategoria, { as: 'subcategorias', foreignKey: 'pai_id' });
ConhecimentoCategoria.hasMany(ConhecimentoArtigo, { as: 'artigos', foreignKey: 'categoria_id' });

ConhecimentoArtigo.belongsTo(ConhecimentoCategoria, { as: 'categoria', foreignKey: 'categoria_id' });
ConhecimentoArtigo.belongsTo(User, { as: 'autor', foreignKey: 'autor_id' });
ConhecimentoArtigo.hasMany(ConhecimentoComentario, { as: 'comentarios', foreignKey: 'artigo_id' });

ConhecimentoComentario.belongsTo(ConhecimentoArtigo, { as: 'artigo', foreignKey: 'artigo_id' });
ConhecimentoComentario.belongsTo(User, { as: 'usuario', foreignKey: 'usuario_id' });

// Grupos Técnicos
GrupoTecnico.belongsTo(AreaAtendimento, { as: 'area', foreignKey: 'area_id' });
GrupoTecnico.belongsTo(User, { as: 'responsavel', foreignKey: 'responsavel_id' });
GrupoTecnico.belongsToMany(User, { through: GrupoTecnicoUsuario, as: 'usuarios', foreignKey: 'grupo_id' });
User.belongsToMany(GrupoTecnico, { through: GrupoTecnicoUsuario, as: 'grupos_tecnicos', foreignKey: 'usuario_id' });

// Multi-entidade
User.belongsTo(Entidade, { as: 'entidade', foreignKey: 'entidade_id' });
Cliente.belongsTo(Entidade, { as: 'entidade', foreignKey: 'entidade_id' });
Chamado.belongsTo(Entidade, { as: 'entidade', foreignKey: 'entidade_id' });
Ativo.belongsTo(Entidade, { as: 'entidade', foreignKey: 'entidade_id' });
Entidade.hasMany(User, { as: 'usuarios', foreignKey: 'entidade_id' });
Entidade.hasMany(Cliente, { as: 'clientes', foreignKey: 'entidade_id' });
Entidade.hasMany(Chamado, { as: 'chamados', foreignKey: 'entidade_id' });
Entidade.hasMany(Ativo, { as: 'ativos', foreignKey: 'entidade_id' });

// Sessões
Session.belongsTo(User, { as: 'usuario', foreignKey: 'usuario_id' });
User.hasMany(Session, { as: 'sessoes', foreignKey: 'usuario_id' });

// Logs de Acesso
LogAcesso.belongsTo(User, { as: 'usuario', foreignKey: 'usuario_id' });
User.hasMany(LogAcesso, { as: 'logs_acesso', foreignKey: 'usuario_id' });

// Configurações da Empresa
EmpresaConfiguracao.belongsTo(Entidade, { as: 'entidade', foreignKey: 'entidade_id' });
Entidade.hasMany(EmpresaConfiguracao, { as: 'configuracoes', foreignKey: 'entidade_id' });

// Relacionamentos de Chamados
ChamadoRelacionado.belongsTo(Chamado, { as: 'chamado_origem', foreignKey: 'chamado_origem_id' });
ChamadoRelacionado.belongsTo(Chamado, { as: 'chamado_destino', foreignKey: 'chamado_destino_id' });
Chamado.hasMany(ChamadoRelacionado, { as: 'relacionamentos_origem', foreignKey: 'chamado_origem_id' });
Chamado.hasMany(ChamadoRelacionado, { as: 'relacionamentos_destino', foreignKey: 'chamado_destino_id' });

// Vínculos Chamado-Ativo
ChamadoVinculoAtivo.belongsTo(Chamado, { as: 'chamado', foreignKey: 'chamado_id' });
ChamadoVinculoAtivo.belongsTo(Ativo, { as: 'ativo', foreignKey: 'ativo_id' });
Chamado.hasMany(ChamadoVinculoAtivo, { as: 'vinculos_ativo', foreignKey: 'chamado_id' });
Ativo.hasMany(ChamadoVinculoAtivo, { as: 'chamados_vinculados', foreignKey: 'ativo_id' });

// Checklist
ChamadoChecklist.belongsTo(ChamadoTipo, { as: 'tipo', foreignKey: 'tipo_id' });
ChamadoTipo.hasMany(ChamadoChecklist, { as: 'checklists', foreignKey: 'tipo_id' });

ChamadoChecklistExecucao.belongsTo(Chamado, { as: 'chamado', foreignKey: 'chamado_id' });
ChamadoChecklistExecucao.belongsTo(ChamadoChecklist, { as: 'checklist', foreignKey: 'checklist_id' });
ChamadoChecklistExecucao.belongsTo(User, { as: 'usuario', foreignKey: 'usuario_id' });
Chamado.hasMany(ChamadoChecklistExecucao, { as: 'checklist_execucao', foreignKey: 'chamado_id' });

// Filas de Chamados
FilaChamado.belongsTo(AreaAtendimento, { as: 'area', foreignKey: 'area_id' });
FilaChamado.belongsTo(GrupoTecnico, { as: 'grupo', foreignKey: 'grupo_id' });

// SLA Regras e Eventos
SlaRegra.belongsTo(SLA, { as: 'sla', foreignKey: 'sla_id' });
SLA.hasMany(SlaRegra, { as: 'regras', foreignKey: 'sla_id' });

SlaEvento.belongsTo(Chamado, { as: 'chamado', foreignKey: 'chamado_id' });
SlaEvento.belongsTo(SLA, { as: 'sla', foreignKey: 'sla_id' });
Chamado.hasMany(SlaEvento, { as: 'sla_eventos', foreignKey: 'chamado_id' });

CalendarioSla.belongsTo(PerfilJornada, { as: 'perfil_jornada', foreignKey: 'perfil_jornada_id' });
PerfilJornada.hasMany(CalendarioSla, { as: 'calendario', foreignKey: 'perfil_jornada_id' });

// Serviços (CMDB)
Servico.belongsTo(User, { as: 'responsavel', foreignKey: 'responsavel_id' });
Servico.belongsTo(AreaAtendimento, { as: 'area', foreignKey: 'area_id' });
Servico.belongsTo(SLA, { as: 'sla', foreignKey: 'sla_id' });

// Dependências de Serviços
DependenciaServico.belongsTo(Servico, { as: 'servico_origem', foreignKey: 'servico_origem_id' });
DependenciaServico.belongsTo(Servico, { as: 'servico_destino', foreignKey: 'servico_destino_id' });
DependenciaServico.belongsTo(Ativo, { as: 'ativo', foreignKey: 'ativo_id' });
Servico.hasMany(DependenciaServico, { as: 'dependencias_origem', foreignKey: 'servico_origem_id' });
Servico.hasMany(DependenciaServico, { as: 'dependencias_destino', foreignKey: 'servico_destino_id' });

// Relacionamentos de Ativos (CMDB)
RelacionamentoAtivo.belongsTo(Ativo, { as: 'ativo_origem', foreignKey: 'ativo_origem_id' });
RelacionamentoAtivo.belongsTo(Ativo, { as: 'ativo_destino', foreignKey: 'ativo_destino_id' });
Ativo.hasMany(RelacionamentoAtivo, { as: 'relacionamentos_origem', foreignKey: 'ativo_origem_id' });
Ativo.hasMany(RelacionamentoAtivo, { as: 'relacionamentos_destino', foreignKey: 'ativo_destino_id' });

// Garantias de Ativos
AtivoGarantia.belongsTo(Ativo, { as: 'ativo_relacionado', foreignKey: 'ativo_id' });
AtivoGarantia.belongsTo(Fornecedor, { as: 'fornecedor', foreignKey: 'fornecedor_id' });
Ativo.hasMany(AtivoGarantia, { as: 'garantias', foreignKey: 'ativo_id' });

// Licenças Atribuições
LicencaAtribuicao.belongsTo(Licenca, { as: 'licenca', foreignKey: 'licenca_id' });
LicencaAtribuicao.belongsTo(User, { as: 'usuario', foreignKey: 'usuario_id' });
LicencaAtribuicao.belongsTo(Ativo, { as: 'ativo_relacionado', foreignKey: 'ativo_id' });
Licenca.hasMany(LicencaAtribuicao, { as: 'atribuicoes', foreignKey: 'licenca_id' });

// Instalações de Software
InstalacaoSoftware.belongsTo(Software, { as: 'software', foreignKey: 'software_id' });
InstalacaoSoftware.belongsTo(Ativo, { as: 'ativo_relacionado', foreignKey: 'ativo_id' });
Software.hasMany(InstalacaoSoftware, { as: 'instalacoes', foreignKey: 'software_id' });
Ativo.hasMany(InstalacaoSoftware, { as: 'softwares_instalados', foreignKey: 'ativo_id' });

// Campos Customizados Opções
CampoCustomizadoOpcao.belongsTo(CampoCustomizado, { as: 'campo', foreignKey: 'campo_id' });
CampoCustomizado.hasMany(CampoCustomizadoOpcao, { as: 'opcoes_valores', foreignKey: 'campo_id' });

// Listas de Distribuição
ListaDistribuicao.belongsTo(AreaAtendimento, { as: 'area', foreignKey: 'area_id' });
ListaDistribuicao.belongsTo(Departamento, { as: 'departamento', foreignKey: 'departamento_id' });

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
  LogSistema,
  Tag,
  ChamadoTag,
  ChamadoAnexo,
  SolucaoPadrao,
  RoteiroAtendimento,
  RoteiroPasso,
  RoteiroExecucao,
  Fabricante,
  Fornecedor,
  TermoResponsabilidade,
  ValorCustomizado,
  ConhecimentoCategoria,
  ConhecimentoArtigo,
  ConhecimentoComentario,
  GrupoTecnico,
  GrupoTecnicoUsuario,
  Entidade,
  Session,
  LogAcesso,
  EmpresaConfiguracao,
  ChamadoRelacionado,
  ChamadoVinculoAtivo,
  ChamadoChecklist,
  ChamadoChecklistExecucao,
  DistribuicaoAutomatica,
  FilaChamado,
  SlaRegra,
  SlaEvento,
  CalendarioSla,
  Servico,
  RelacionamentoAtivo,
  DependenciaServico,
  AtivoGarantia,
  LicencaAtribuicao,
  InstalacaoSoftware,
  CampoCustomizadoOpcao,
  ConfiguracaoSistema,
  EmailSmtp,
  EmailTemplate,
  ListaDistribuicao
};
