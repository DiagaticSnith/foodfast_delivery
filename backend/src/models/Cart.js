const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Cart = sequelize.define('Cart', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
});

Cart.associate = (models) => {
  Cart.belongsTo(models.User, { foreignKey: 'userId' });
  Cart.hasMany(models.CartItem, { foreignKey: 'cartId' });
};

module.exports = Cart;
