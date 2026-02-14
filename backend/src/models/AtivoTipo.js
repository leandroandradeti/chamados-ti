const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AtivoTipo = sequelize.define('AtivoTipo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  icone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  campos_obrigatorios: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'ativo_tipos',
  paranoid: true
});

const AtivoModelo = sequelize.define('AtivoModelo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fabricante: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tipo_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'ativo_tipos', key: 'id' }
  },
  especificacoes: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'ativo_modelos',
  paranoid: true
});

const AtivoCategoria = sequelize.define('AtivoCategoria', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pai_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'ativo_categorias', key: 'id' }
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'ativo_categorias',
  paranoid: true
});

const AtivoStatus = sequelize.define('AtivoStatus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cor: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  tipo: {
    type: DataTypes.ENUM('disponivel', 'em_uso', 'manutencao', 'estoque', 'baixado', 'emprestado'),
    allowNull: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'ativo_status',
  paranoid: true
});

module.exports = { AtivoTipo, AtivoModelo, AtivoCategoria, AtivoStatus };
