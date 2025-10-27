"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ensure Restaurants table uses utf8mb4 for proper Vietnamese accents
    // Convert table and its string columns to utf8mb4/utf8mb4_unicode_ci
    await queryInterface.sequelize.query(
      "ALTER TABLE `Restaurants` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to MySQL default utf8 (not recommended). If original was latin1, update accordingly.
    await queryInterface.sequelize.query(
      "ALTER TABLE `Restaurants` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
    );
  },
};
