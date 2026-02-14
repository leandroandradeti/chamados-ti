const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('Role', {
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
  nivel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '1=Admin, 2=Gestor, 3=Técnico, 4=Solicitante, 5=Auditor'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Auditoria
  criado_por: {
    type: DataTypes.UUID,
    allowNull: true
  },
  atualizado_por: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'roles',
  paranoid: true
});

module.exports = Role;
