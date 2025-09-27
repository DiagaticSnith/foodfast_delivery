const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Cart = sequelize.define('Cart', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
});

Cart.associate = (models) => {
  Cart.belongsTo(models.User, { foreignKey: 'userId' });
};

module.exports = Cart;
