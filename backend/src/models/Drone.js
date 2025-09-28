const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Drone = sequelize.define('Drone', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'available', // available, busy, maintenance
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // shipper assigned
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  tableName: 'Drones'
});

Drone.associate = (models) => {
  Drone.belongsTo(models.User, { foreignKey: 'userId' });
  Drone.hasMany(models.Order, { foreignKey: 'droneId' });
};

module.exports = Drone;
