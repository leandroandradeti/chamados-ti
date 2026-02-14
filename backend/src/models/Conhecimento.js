const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConhecimentoCategoria = sequelize.define('ConhecimentoCategoria', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pai_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'conhecimento_categorias', key: 'id' }
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
  tableName: 'conhecimento_categorias',
  paranoid: true
});

const ConhecimentoArtigo = sequelize.define('ConhecimentoArtigo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  titulo: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  conteudo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  resumo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoria_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'conhecimento_categorias', key: 'id' }
  },
  autor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  palavras_chave: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  publico: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Visível para todos os usuários'
  },
  destaque: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Destacar na página inicial'
  },
  visualizacoes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  util: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Quantidade de votos útil'
  },
  nao_util: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Quantidade de votos não útil'
  },
  status: {
    type: DataTypes.ENUM('rascunho', 'publicado', 'arquivado'),
    defaultValue: 'rascunho'
  },
  publicado_em: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'conhecimento_artigos',
  paranoid: true
});

const ConhecimentoComentario = sequelize.define('ConhecimentoComentario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  artigo_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'conhecimento_artigos', key: 'id' }
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
  aprovado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'conhecimento_comentarios',
  updatedAt: false,
  paranoid: false
});

module.exports = { 
  ConhecimentoCategoria, 
  ConhecimentoArtigo, 
  ConhecimentoComentario 
};
