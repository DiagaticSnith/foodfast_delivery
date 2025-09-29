"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.ENUM("admin", "user", "shipper", "shipperpending"),
      defaultValue: "user",
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.ENUM("admin", "user"),
      defaultValue: "user",
    });
  },
};
