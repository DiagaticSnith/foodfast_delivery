require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql', // Phải có dòng này để chỉ định dialect
    timezone: '+07:00',
    dialectOptions: {
      charset: 'utf8mb4',
      dateStrings: true,
      typeCast: true,
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connected');
    try {
      await sequelize.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
    } catch (e) {
      console.warn('Warning: failed to set UTF8MB4 at session level:', e?.message || e);
    }
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };