const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Fabricante = sequelize.define('Fabricante', {
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
  site: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  contato: {
    type: DataTypes.STRING(255),
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
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'fabricantes',
  paranoid: true
});

const Fornecedor = sequelize.define('Fornecedor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cnpj: {
    type: DataTypes.STRING(18),
    unique: true,
    allowNull: true
  },
  contato: {
    type: DataTypes.STRING(255),
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
  endereco: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'fornecedores',
  paranoid: true
});

const TermoResponsabilidade = sequelize.define('TermoResponsabilidade', {
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
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  data_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  data_fim: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  termo_texto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  assinatura_digital: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  ip_assinatura: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  data_assinatura: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'termos_responsabilidade',
  updatedAt: false,
  paranoid: false
});

module.exports = { Fabricante, Fornecedor, TermoResponsabilidade };
