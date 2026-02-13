const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const SLA = sequelize.define('SLA', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tempo_primeira_resposta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tempo em minutos'
  },
  tempo_resolucao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tempo em minutos'
  },
  horario_comercial: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Se true, conta apenas horário comercial'
  },
  considera_feriados: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  perfil_jornada_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'perfis_jornada', key: 'id' }
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'slas',
  paranoid: true
});

module.exports = SLA;
