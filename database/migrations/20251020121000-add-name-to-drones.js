"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Drones');
    if (!table.name) {
      await queryInterface.addColumn('Drones', 'name', {
        type: Sequelize.STRING,
        allowNull: false,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Drones');
    if (table.name) {
      await queryInterface.removeColumn('Drones', 'name');
    }
  }
};
