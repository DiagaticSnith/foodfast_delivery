module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Restaurants', [
      {
        name: 'Pizza Drone',
        address: '123 Drone St, HN',
        promotion: 'Giảm 10% cho đơn đầu tiên',
        landingPad: 'Pad A',
        imageUrl: 'https://example.com/pizza.jpg',
        description: 'Nhà hàng pizza giao bằng drone',
        noFlyZones: JSON.stringify(['Zone 1', 'Zone 2']),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Sushi Drone',
        address: '456 Drone St, HCM',
        promotion: 'Freeship cho đơn trên 200k',
        landingPad: 'Pad B',
        imageUrl: 'https://example.com/sushi.jpg',
        description: 'Nhà hàng sushi giao bằng drone',
        noFlyZones: JSON.stringify(['Zone 3']),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Restaurants', null, {});
  }
};