'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Menu', [
      {
        name: 'Pizza Margherita',
        price: 120000,
        description: 'Pizza truyền thống Ý với phô mai và sốt cà chua',
        category: 'Pizza',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Burger Bò',
        price: 90000,
        description: 'Burger bò phô mai đặc biệt',
        category: 'Burger',
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cơm Gà Hải Nam',
        price: 70000,
        description: 'Cơm gà Hải Nam chuẩn vị',
        category: 'Cơm',
        imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Menu', null, {});
  }
};
