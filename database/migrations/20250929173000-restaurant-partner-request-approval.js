"use strict";

// This migration is now a no-op because the 'location' column has already been removed from the Drones table.

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // No operation: location column already removed or does not exist
  },
  down: async (queryInterface, Sequelize) => {
    // No operation: location column already removed or does not exist
  },
};
