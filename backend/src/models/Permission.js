const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  modulo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'home, ocorrencias, inventario, clientes, admin, api'
  },
  recurso: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'chamados, ativos, usuarios, etc'
  },
  acao: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'create, read, update, delete, list, execute'
  },
  descricao: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'permissions',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['modulo', 'recurso', 'acao']
    }
  ]
});

module.exports = Permission;
