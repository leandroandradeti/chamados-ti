const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChamadoPrioridade = sequelize.define('ChamadoPrioridade', {
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
  nivel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '1=Crítica, 2=Alta, 3=Média, 4=Baixa'
  },
  cor: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  icone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  tempo_resposta_horas: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tempo padrão de resposta em horas'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'chamado_prioridades',
  paranoid: true
});

module.exports = ChamadoPrioridade;
