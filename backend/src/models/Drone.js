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
  launchpad: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  battery: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
    comment: 'Battery level percentage 0-100',
  },
}, {
  tableName: 'Drones'
});


Drone.associate = (models) => {
  Drone.hasMany(models.Order, { foreignKey: 'droneId' });
};

module.exports = Drone;
