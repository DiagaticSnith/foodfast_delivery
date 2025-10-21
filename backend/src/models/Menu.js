
const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Menu = sequelize.define('Menu', {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  description: DataTypes.STRING,
  category: DataTypes.STRING,
  imageUrl: DataTypes.STRING,
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Restaurants',
      key: 'id',
    },
  },
}, {
  tableName: 'Menu'
});

Menu.associate = (models) => {
  Menu.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' });
};

module.exports = Menu;