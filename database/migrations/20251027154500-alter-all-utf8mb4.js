"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Set current database and all main tables to utf8mb4
    const [[{ db }]] = await queryInterface.sequelize.query('SELECT DATABASE() AS db');
    if (db) {
      try {
        await queryInterface.sequelize.query(`ALTER DATABASE \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      } catch (e) {
        console.warn('Warning: cannot alter database charset (permission?):', e?.message || e);
      }
    }

    const tables = [
      'Users','Menus','Orders','OrderDetails','CartItems','Carts','Restaurants','Drones'
    ];
    for (const t of tables) {
      try {
        await queryInterface.sequelize.query(`ALTER TABLE \`${t}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      } catch (e) {
        console.warn(`Warning: alter table ${t} failed:`, e?.message || e);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No-op rollback: reverting charset globally is not recommended
  }
};
