const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  role: { type: DataTypes.ENUM('admin', 'user', 'restaurant', 'restaurantpending'), defaultValue: 'user' },
  address: { type: DataTypes.STRING, allowNull: true },
  phoneNumber: { type: DataTypes.STRING, allowNull: true },
});

User.associate = (models) => {
  User.hasOne(models.Cart, { foreignKey: 'userId' });
  User.hasMany(models.Order, { foreignKey: 'userId' });
  // Xóa quan hệ với Drone vì Drone không có userId
};

module.exports = User;