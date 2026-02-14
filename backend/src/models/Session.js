const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Session - Sessões de usuário
const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true
  },
  refresh_token: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'sessions',
  updatedAt: true,
  paranoid: false
});

// LogAcesso - Logs de acesso ao sistema
const LogAcesso = sequelize.define('LogAcesso', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  acao: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  sucesso: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  detalhes: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'logs_acesso',
  updatedAt: false,
  paranoid: false
});

// EmpresaConfiguracao
const EmpresaConfiguracao = sequelize.define('EmpresaConfiguracao', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  entidade_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'entidades', key: 'id' }
  },
  chave: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  valor: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo: {
    type: DataTypes.STRING(50),
    defaultValue: 'string'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'empresas_configuracoes',
  indexes: [
    {
      unique: true,
      fields: ['entidade_id', 'chave']
    }
  ]
});

module.exports = { Session, LogAcesso, EmpresaConfiguracao };
