"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Thêm giá trị mới cho ENUM role
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.ENUM("admin", "user", "restaurant", "restaurantpending"),
      defaultValue: "user",
    });
    // Không thêm cột name vì đã tồn tại
  },
  down: async (queryInterface, Sequelize) => {
    // Quay lại ENUM cũ
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.ENUM("admin", "user"),
      defaultValue: "user",
    });
    // Không xóa cột name vì đã có từ trước
  },
};
