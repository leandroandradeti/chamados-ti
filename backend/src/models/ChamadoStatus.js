const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChamadoStatus = sequelize.define('ChamadoStatus', {
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
  tipo: {
    type: DataTypes.ENUM('aberto', 'em_andamento', 'aguardando', 'resolvido', 'fechado', 'cancelado'),
    allowNull: false
  },
  cor: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  icone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  pausa_sla: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se true, pausa contagem do SLA'
  },
  ordem: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status_final: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica se é um status de conclusão'
  }
}, {
  tableName: 'chamado_status',
  paranoid: true
});

module.exports = ChamadoStatus;
