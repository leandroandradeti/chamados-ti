const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Software = sequelize.define('Software', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fabricante: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  versao: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  categoria_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'software_categorias', key: 'id' }
  },
  tipo_licenca_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'tipo_licencas', key: 'id' }
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
  tableName: 'softwares',
  paranoid: true
});

const Licenca = sequelize.define('Licenca', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  software_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'softwares', key: 'id' }
  },
  chave_licenca: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  tipo_licenca_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'tipo_licencas', key: 'id' }
  },
  quantidade_licencas: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  em_uso: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  data_aquisicao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  data_expiracao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  valor: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  fornecedor: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  nota_fiscal: {
    type: DataTypes.STRING(100),
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
  tableName: 'licencas',
  paranoid: true
});

const TipoLicenca = sequelize.define('TipoLicenca', {
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
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'tipo_licencas',
  paranoid: true
});

const SoftwareCategoria = sequelize.define('SoftwareCategoria', {
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
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'software_categorias',
  paranoid: true
});

module.exports = { Software, Licenca, TipoLicenca, SoftwareCategoria };
