"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Only drop the column if it exists (for safety across environments)
    const table = await queryInterface.describeTable('Restaurants');
    if (table.noFlyZones) {
      await queryInterface.removeColumn('Restaurants', 'noFlyZones');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add the column on rollback
    const table = await queryInterface.describeTable('Restaurants');
    if (!table.noFlyZones) {
      await queryInterface.addColumn('Restaurants', 'noFlyZones', {
        type: Sequelize.JSON,
        allowNull: true,
      });
    }
  }
};
