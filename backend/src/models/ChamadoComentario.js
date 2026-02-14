const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChamadoComentario = sequelize.define('ChamadoComentario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  chamado_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'chamados', key: 'id' }
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('publico', 'interno'),
    defaultValue: 'publico'
  },
  editado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  data_edicao: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'chamado_comentarios',
  paranoid: true
});

module.exports = ChamadoComentario;
