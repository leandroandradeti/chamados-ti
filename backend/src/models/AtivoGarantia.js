const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// AtivoGarantia - Garantias de ativos
const AtivoGarantia = sequelize.define('AtivoGarantia', {
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
  fornecedor_id: {
    type: DataTypes.UUID,
    references: { model: 'fornecedores', key: 'id' }
  },
  data_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  data_fim: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  tipo_garantia: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'fabricante, estendida, on-site, etc'
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
  tableName: 'ativo_garantias',
  paranoid: true
});

// LicencaAtribuicao - Atribuições de licenças a usuários/ativos
const LicencaAtribuicao = sequelize.define('LicencaAtribuicao', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  licenca_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'licencas', key: 'id' }
  },
  usuario_id: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  ativo_id: {
    type: DataTypes.UUID,
    references: { model: 'ativos', key: 'id' }
  },
  data_atribuicao: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  data_revogacao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'licencas_atribuicoes',
  paranoid: false
});

// InstalacaoSoftware - Software instalado em ativos
const InstalacaoSoftware = sequelize.define('InstalacaoSoftware', {
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
  ativo_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'ativos', key: 'id' }
  },
  versao_instalada: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  data_instalacao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  chave_produto: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'instalacoes_software',
  paranoid: true
});

module.exports = { AtivoGarantia, LicencaAtribuicao, InstalacaoSoftware };
