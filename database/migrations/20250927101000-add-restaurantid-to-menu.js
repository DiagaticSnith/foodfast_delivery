module.exports = {
  up: async (queryInterface, Sequelize) => {
  await queryInterface.addColumn('Menu', 'restaurantId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Restaurants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
  down: async (queryInterface) => {
  await queryInterface.removeColumn('Menu', 'restaurantId');
  }
};