const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const AtivoHistoricoLocalizacao = sequelize.define('AtivoHistoricoLocalizacao', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ativo_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'ativos', key: 'id' }
  },
  localizacao_anterior_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'unidades', key: 'id' }
  },
  localizacao_nova_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'unidades', key: 'id' }
  },
  responsavel_anterior_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  responsavel_novo_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  motivo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data_movimentacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  realizado_por_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'ativo_historico_localizacao',
  updatedAt: false
});

module.exports = AtivoHistoricoLocalizacao;
