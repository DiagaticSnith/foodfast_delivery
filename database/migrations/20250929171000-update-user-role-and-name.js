"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Thêm giá trị mới cho ENUM role
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.ENUM("admin", "user", "shipper", "shipperpending"),
      defaultValue: "user",
    });
    // Thêm cột name
    await queryInterface.addColumn("Users", "name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Xóa cột name
    await queryInterface.removeColumn("Users", "name");
    // Quay lại ENUM cũ
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.ENUM("admin", "user"),
      defaultValue: "user",
    });
  },
};
