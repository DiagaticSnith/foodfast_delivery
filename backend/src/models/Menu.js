const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Menu = sequelize.define('Menu', {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  description: DataTypes.STRING,
  category: DataTypes.STRING,
});

module.exports = Menu;