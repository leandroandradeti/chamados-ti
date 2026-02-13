const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Entidade = sequelize.define('Entidade', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  razao_social: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  cnpj: {
    type: DataTypes.STRING(18),
    unique: true,
    allowNull: true
  },
  matriz_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'entidades', key: 'id' },
    comment: 'Referência para matriz (se for filial)'
  },
  endereco: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'entidades',
  paranoid: true
});

// Auto-relacionamento para matriz/filial
Entidade.belongsTo(Entidade, { as: 'matriz', foreignKey: 'matriz_id' });
Entidade.hasMany(Entidade, { as: 'filiais', foreignKey: 'matriz_id' });

module.exports = Entidade;
