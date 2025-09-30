"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Drones", "location", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
