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
        restaurantId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Burger Bò',
        price: 90000,
        description: 'Burger bò phô mai đặc biệt',
        category: 'Burger',
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
        restaurantId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cơm Gà Hải Nam',
        price: 70000,
        description: 'Cơm gà Hải Nam chuẩn vị',
        category: 'Cơm',
        imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc',
        restaurantId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sushi Cá Hồi',
        price: 150000,
        description: 'Sushi cá hồi tươi ngon',
        category: 'Sushi',
        imageUrl: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0',
        restaurantId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bún Chả Hà Nội',
        price: 60000,
        description: 'Bún chả truyền thống Hà Nội',
        category: 'Bún',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        restaurantId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Phở Bò',
        price: 65000,
        description: 'Phở bò thơm ngon chuẩn vị',
        category: 'Phở',
        imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c',
        restaurantId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gà Rán',
        price: 80000,
        description: 'Gà rán giòn tan',
        category: 'Gà',
        imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c',
        restaurantId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mì Ý Bò Bằm',
        price: 85000,
        description: 'Mì Ý sốt bò bằm',
        category: 'Mì',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        restaurantId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Salad Caesar',
        price: 70000,
        description: 'Salad Caesar tươi mát',
        category: 'Salad',
        imageUrl: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0',
        restaurantId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bánh Mì Thịt',
        price: 30000,
        description: 'Bánh mì thịt truyền thống',
        category: 'Bánh mì',
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
        restaurantId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lẩu Thái',
        price: 200000,
        description: 'Lẩu Thái chua cay',
        category: 'Lẩu',
        imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc',
        restaurantId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bánh Xèo',
        price: 50000,
        description: 'Bánh xèo miền Tây',
        category: 'Bánh xèo',
        imageUrl: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0',
        restaurantId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tôm Hùm Nướng',
        price: 350000,
        description: 'Tôm hùm nướng bơ tỏi',
        category: 'Hải sản',
        imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c',
        restaurantId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sườn Nướng BBQ',
        price: 180000,
        description: 'Sườn nướng sốt BBQ',
        category: 'BBQ',
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
        restaurantId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bánh Cuốn',
        price: 40000,
        description: 'Bánh cuốn nóng',
        category: 'Bánh cuốn',
        imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc',
        restaurantId: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cháo Sườn',
        price: 35000,
        description: 'Cháo sườn thơm ngon',
        category: 'Cháo',
        imageUrl: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0',
        restaurantId: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bún Bò Huế',
        price: 70000,
        description: 'Bún bò Huế cay nồng',
        category: 'Bún',
        imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c',
        restaurantId: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mì Quảng',
        price: 65000,
        description: 'Mì Quảng đặc sản Đà Nẵng',
        category: 'Mì',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        restaurantId: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cá Kho Tộ',
        price: 90000,
        description: 'Cá kho tộ miền Nam',
        category: 'Cá',
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
        restaurantId: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bánh Flan',
        price: 25000,
        description: 'Bánh flan tráng miệng',
        category: 'Tráng miệng',
        imageUrl: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0',
        restaurantId: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Menu', null, {});
  }
};
