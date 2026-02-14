const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Unidade = sequelize.define('Unidade', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cliente_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'clientes', key: 'id' }
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true
  },
  endereco: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  cep: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  responsavel_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'unidades',
  paranoid: true
});

const Departamento = sequelize.define('Departamento', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  unidade_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'unidades', key: 'id' }
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true
  },
  responsavel_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'departamentos',
  paranoid: true
});

const CentroCusto = sequelize.define('CentroCusto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  departamento_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'departamentos', key: 'id' }
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'centros_custo',
  paranoid: true
});

module.exports = { Unidade, Departamento, CentroCusto };
