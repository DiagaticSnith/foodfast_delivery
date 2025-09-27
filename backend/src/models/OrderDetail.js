const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const Order = require('./Order');
const Menu = require('./Menu');

const OrderDetail = sequelize.define('OrderDetail', {
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  menuId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
});

OrderDetail.belongsTo(Order, { foreignKey: 'orderId' });
OrderDetail.belongsTo(Menu, { foreignKey: 'menuId' });

module.exports = OrderDetail;
