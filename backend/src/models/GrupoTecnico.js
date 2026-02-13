const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const GrupoTecnico = sequelize.define('GrupoTecnico', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  area_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'areas_atendimento', key: 'id' }
  },
  responsavel_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'grupos_tecnicos',
  paranoid: true
});

const GrupoTecnicoUsuario = sequelize.define('GrupoTecnicoUsuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  grupo_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'grupos_tecnicos', key: 'id' }
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  coordenador: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se o usuário é coordenador do grupo'
  }
}, {
  tableName: 'grupo_tecnico_usuarios',
  updatedAt: false,
  paranoid: false
});

module.exports = { GrupoTecnico, GrupoTecnicoUsuario };
