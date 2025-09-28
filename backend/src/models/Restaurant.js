const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  promotion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  landingPad: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  noFlyZones: {
    type: DataTypes.JSON,
    allowNull: true,
  }
});

Restaurant.associate = (models) => {
  Restaurant.hasMany(models.Menu, { foreignKey: 'restaurantId' });
};

module.exports = Restaurant;