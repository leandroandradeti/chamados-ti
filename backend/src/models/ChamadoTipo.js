const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ChamadoTipo = sequelize.define('ChamadoTipo', {
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
  cor: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  sla_padrao_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'slas', key: 'id' }
  },
  area_padrao_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'areas_atendimento', key: 'id' }
  },
  requer_aprovacao: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  campos_obrigatorios: {
    type: DataTypes.JSONB,
    defaultValue: []
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
  tableName: 'chamado_tipos',
  paranoid: true
});

module.exports = ChamadoTipo;
