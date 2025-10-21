'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'Restaurants';
    const desc = await queryInterface.describeTable(table);
    if (!desc.status) {
      await queryInterface.addColumn(table, 'status', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active',
      });
    }
  },
  async down(queryInterface) {
    const table = 'Restaurants';
    const desc = await queryInterface.describeTable(table);
    if (desc.status) {
      await queryInterface.removeColumn(table, 'status');
    }
  }
};
