"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("Restaurants", [
      {
        name: "Nhà hàng A",
        address: "123 Đường A, Quận 1, TP.HCM",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Nhà hàng B",
        address: "456 Đường B, Quận 3, TP.HCM",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Restaurants", null, {});
  },
};
