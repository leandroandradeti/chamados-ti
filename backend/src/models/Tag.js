const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tag = sequelize.define('Tag', {
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
  cor: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'tags',
  paranoid: true
});

const ChamadoTag = sequelize.define('ChamadoTag', {
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
  tag_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'tags', key: 'id' }
  }
}, {
  tableName: 'chamado_tags',
  timestamps: true,
  updatedAt: false,
  paranoid: false
});

const ChamadoAnexo = sequelize.define('ChamadoAnexo', {
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
  nome_arquivo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  caminho_arquivo: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  tamanho_bytes: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  tipo_mime: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'chamado_anexos',
  updatedAt: false,
  paranoid: false
});

module.exports = { Tag, ChamadoTag, ChamadoAnexo };
