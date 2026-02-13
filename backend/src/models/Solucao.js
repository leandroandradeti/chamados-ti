const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const SolucaoPadrao = sequelize.define('SolucaoPadrao', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  solucao: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'chamado_tipos', key: 'id' }
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  palavras_chave: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  visualizacoes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  util: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  nao_util: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  criado_por: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'solucoes_padrao',
  paranoid: true
});

const RoteiroAtendimento = sequelize.define('RoteiroAtendimento', {
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
  tipo_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'chamado_tipos', key: 'id' }
  },
  ordem: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'roteiros_atendimento',
  paranoid: true
});

const RoteiroPasso = sequelize.define('RoteiroPasso', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  roteiro_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'roteiros_atendimento', key: 'id' }
  },
  ordem: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  obrigatorio: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tempo_estimado_minutos: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'roteiro_passos',
  updatedAt: false,
  paranoid: false
});

const RoteiroExecucao = sequelize.define('RoteiroExecucao', {
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
  roteiro_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'roteiros_atendimento', key: 'id' }
  },
  passo_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'roteiro_passos', key: 'id' }
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  concluido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tempo_gasto_minutos: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'roteiro_execucao',
  updatedAt: false,
  paranoid: false
});

module.exports = { 
  SolucaoPadrao, 
  RoteiroAtendimento, 
  RoteiroPasso, 
  RoteiroExecucao 
};
