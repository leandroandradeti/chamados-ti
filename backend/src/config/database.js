const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 20,
    min: parseInt(process.env.DB_POOL_MIN) || 5,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    paranoid: process.env.SOFT_DELETE === 'true', // Soft delete
    freezeTableName: false,
    charset: 'utf8',
    collate: 'utf8_general_ci'
  },
  timezone: process.env.TIMEZONE || '-03:00'
});

module.exports = { sequelize, Sequelize };
