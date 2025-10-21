"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Menu');
    if (!table.name) {
      await queryInterface.addColumn('Menu', 'name', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Menu');
    if (table.name) {
      await queryInterface.removeColumn('Menu', 'name');
    }
  }
};
