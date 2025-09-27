const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Order = sequelize.define('Order', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  total: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' },
  address: { type: DataTypes.STRING, allowNull: false },
});

Order.associate = (models) => {
  Order.belongsTo(models.User, { foreignKey: 'userId' });
  Order.hasMany(models.OrderDetail, { foreignKey: 'orderId' });
};

module.exports = Order;