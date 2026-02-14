const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// ChamadoRelacionado - Relacionamentos entre chamados
const ChamadoRelacionado = sequelize.define('ChamadoRelacionado', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  chamado_origem_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'chamados', key: 'id' }
  },
  chamado_destino_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'chamados', key: 'id' }
  },
  tipo_relacao: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'pai, filho, duplicado, relacionado, bloqueado_por'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  criado_por: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'chamados_relacionados',
  updatedAt: false,
  paranoid: false,
  indexes: [
    {
      unique: true,
      fields: ['chamado_origem_id', 'chamado_destino_id', 'tipo_relacao']
    }
  ]
});

// ChamadoVinculoAtivo - Vínculos entre chamados e ativos
const ChamadoVinculoAtivo = sequelize.define('ChamadoVinculoAtivo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  chamado_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'chamados', key: 'id' }
  },
  ativo_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'ativos', key: 'id' }
  },
  tipo_vinculo: {
    type: DataTypes.STRING(50),
    defaultValue: 'afetado',
    comment: 'afetado, relacionado, causa'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  criado_por: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'chamados_vinculos_ativo',
  updatedAt: false,
  paranoid: false,
  indexes: [
    {
      unique: true,
      fields: ['chamado_id', 'ativo_id']
    }
  ]
});

// ChamadoChecklist - Templates de checklist para tipos de chamado
const ChamadoChecklist = sequelize.define('ChamadoChecklist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tipo_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'chamado_tipos', key: 'id' }
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ordem: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  obrigatorio: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'chamados_checklist',
  paranoid: true
});

// ChamadoChecklistExecucao - Execução de checklist em chamados
const ChamadoChecklistExecucao = sequelize.define('ChamadoChecklistExecucao', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  chamado_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'chamados', key: 'id' }
  },
  checklist_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'chamados_checklist', key: 'id' }
  },
  concluido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  usuario_id: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  concluido_em: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'chamado_checklist_execucao',
  updatedAt: false,
  paranoid: false
});

// DistribuicaoAutomatica - Regras de distribuição automática
const DistribuicaoAutomatica = sequelize.define('DistribuicaoAutomatica', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  prioridade: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  condicoes: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: '{tipo_id: [], area_id: [], prioridade_id: [], palavras_chave: []}'
  },
  acao_tipo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'atribuir_usuario, atribuir_grupo, definir_area'
  },
  acao_valor: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: '{usuario_id: "", grupo_id: "", area_id: ""}'
  }
}, {
  tableName: 'distribuicao_automatica',
  paranoid: true
});

// FilaChamado - Filas de chamados
const FilaChamado = sequelize.define('FilaChamado', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  area_id: {
    type: DataTypes.UUID,
    references: { model: 'areas_atendimento', key: 'id' }
  },
  grupo_id: {
    type: DataTypes.UUID,
    references: { model: 'grupos_tecnicos', key: 'id' }
  },
  criterios: {
    type: DataTypes.JSONB,
    comment: '{status: [], prioridades: [], tipos: []}'
  },
  ordem: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  cor: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  icone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'filas_chamados',
  paranoid: true
});

module.exports = {
  ChamadoRelacionado,
  ChamadoVinculoAtivo,
  ChamadoChecklist,
  ChamadoChecklistExecucao,
  DistribuicaoAutomatica,
  FilaChamado
};
