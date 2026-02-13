const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ValorCustomizado = sequelize.define('ValorCustomizado', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  campo_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'campos_customizados', key: 'id' }
  },
  entidade_tipo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'chamado, ativo, cliente, etc'
  },
  entidade_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID do registro específico'
  },
  valor: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'valores_customizados',
  indexes: [
    {
      unique: false,
      fields: ['campo_id', 'entidade_tipo', 'entidade_id']
    }
  ]
});

module.exports = ValorCustomizado;
