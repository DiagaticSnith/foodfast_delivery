const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Order = sequelize.define('Order', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  total: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' },
  address: { type: DataTypes.STRING, allowNull: false },
  sessionId: { type: DataTypes.STRING, allowNull: true }, // Lưu session_id Stripe
  droneId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Drones',
      key: 'id',
    },
  },
});

Order.associate = (models) => {
  Order.belongsTo(models.User, { foreignKey: 'userId' });
  Order.belongsTo(models.Drone, { foreignKey: 'droneId' });
  Order.hasMany(models.OrderDetail, { foreignKey: 'orderId' });
};

module.exports = Order;