const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const User = require('./User');

const Order = sequelize.define('Order', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  total: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' },
  address: { type: DataTypes.STRING, allowNull: false },
});

Order.belongsTo(User, { foreignKey: 'userId' });
module.exports = Order;