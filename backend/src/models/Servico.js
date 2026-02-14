const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Servico - Serviços de TI (CMDB)
const Servico = sequelize.define('Servico', {
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
  tipo: {
    type: DataTypes.STRING(100),
    comment: 'aplicacao, infraestrutura, negocio'
  },
  criticidade: {
    type: DataTypes.STRING(50),
    comment: 'baixa, media, alta, critica'
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'ativo',
    comment: 'ativo, inativo, manutencao'
  },
  responsavel_id: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  area_id: {
    type: DataTypes.UUID,
    references: { model: 'areas_atendimento', key: 'id' }
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  documentacao_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  sla_id: {
    type: DataTypes.UUID,
    references: { model: 'slas', key: 'id' }
  },
  disponibilidade_meta: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Porcentagem'
  },
  tempo_resposta_meta: {
    type: DataTypes.INTEGER,
    comment: 'Milissegundos'
  },
  dados_adicionais: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'servicos',
  paranoid: true
});

// RelacionamentoAtivo - Relacionamentos entre ativos (CMDB)
const RelacionamentoAtivo = sequelize.define('RelacionamentoAtivo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ativo_origem_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'ativos', key: 'id' }
  },
  ativo_destino_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'ativos', key: 'id' }
  },
  tipo_relacao: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'conectado_a, depende_de, parte_de, hospeda'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  porta_origem: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  porta_destino: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  criado_por: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'relacionamentos_ativos',
  indexes: [
    {
      unique: true,
      fields: ['ativo_origem_id', 'ativo_destino_id', 'tipo_relacao']
    }
  ]
});

// DependenciaServico - Dependências entre serviços
const DependenciaServico = sequelize.define('DependenciaServico', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  servico_origem_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'servicos', key: 'id' }
  },
  servico_destino_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'servicos', key: 'id' }
  },
  ativo_id: {
    type: DataTypes.UUID,
    references: { model: 'ativos', key: 'id' }
  },
  tipo_dependencia: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'forte, fraca, bidirecional'
  },
  criticidade: {
    type: DataTypes.STRING(50),
    comment: 'baixa, media, alta'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'dependencias_servicos',
  updatedAt: false,
  paranoid: false,
  indexes: [
    {
      unique: true,
      fields: ['servico_origem_id', 'servico_destino_id']
    }
  ]
});

module.exports = { Servico, RelacionamentoAtivo, DependenciaServico };
