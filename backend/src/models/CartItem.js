const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const Menu = require('./Menu');

const CartItem = sequelize.define('CartItem', {
  cartId: { type: DataTypes.INTEGER, allowNull: false },
  menuId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
});

CartItem.belongsTo(Menu, { foreignKey: 'menuId' });

module.exports = CartItem;
