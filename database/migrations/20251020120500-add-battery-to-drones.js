"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Drones');
    if (!table.battery) {
      await queryInterface.addColumn('Drones', 'battery', {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: { min: 0, max: 100 },
        comment: 'Battery level percentage 0-100'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Drones');
    if (table.battery) {
      await queryInterface.removeColumn('Drones', 'battery');
    }
  }
};
