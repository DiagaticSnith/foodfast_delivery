const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  role: { type: DataTypes.ENUM('admin', 'user'), defaultValue: 'user' },
});

module.exports = User;