module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'droneId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Drones',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Orders', 'droneId');
  }
};
