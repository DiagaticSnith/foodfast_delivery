const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Review = sequelize.define('Review', {
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('approved','pending','hidden'), allowNull: false, defaultValue: 'pending' }
}, {
  tableName: 'Reviews'
});

Review.associate = (models) => {
  Review.belongsTo(models.User, { foreignKey: 'userId' });
  Review.belongsTo(models.Menu, { foreignKey: 'menuId' });
};

module.exports = Review;
