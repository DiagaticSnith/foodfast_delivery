"use strict";

/**
 * Seed 50 menu items into Menu, targeting the first restaurant owned by userId=1.
 * Falls back gracefully if no restaurant for userId=1 (does nothing).
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // fetch a restaurant id for userId=1
    const [restaurants] = await queryInterface.sequelize.query(
      "SELECT id FROM Restaurants WHERE userId = 1 LIMIT 1;"
    );

    if (!restaurants || restaurants.length === 0) {
      console.log('[seed_50_menu_items_for_user1] No restaurant found for userId=1. Skipping.');
      return;
    }

    const restaurantId = restaurants[0].id;
    const now = new Date();

    const rows = [
      { name: 'Pizza Margherita', price: 95000, description: 'Classic pizza with tomato, mozzarella, basil', category: 'Pizza', imageUrl: 'https://example.com/img/pizza_margherita.jpg' },
      { name: 'Pizza Pepperoni', price: 115000, description: 'Pepperoni, mozzarella, tomato sauce', category: 'Pizza', imageUrl: 'https://example.com/img/pizza_pepperoni.jpg' },
      { name: 'Pizza Hawaiian', price: 120000, description: 'Ham, pineapple, mozzarella', category: 'Pizza', imageUrl: 'https://example.com/img/pizza_hawaiian.jpg' },
      { name: 'Pizza Four Cheese', price: 135000, description: 'Mozzarella, gorgonzola, parmesan, fontina', category: 'Pizza', imageUrl: 'https://example.com/img/pizza_4cheese.jpg' },
      { name: 'Pizza BBQ Chicken', price: 129000, description: 'BBQ sauce, chicken, onion, mozzarella', category: 'Pizza', imageUrl: 'https://example.com/img/pizza_bbq_chicken.jpg' },
      { name: 'Pizza Veggie', price: 110000, description: 'Bell pepper, mushroom, olive, onion', category: 'Pizza', imageUrl: 'https://example.com/img/pizza_veggie.jpg' },
      { name: 'Pizza Seafood', price: 149000, description: 'Shrimp, squid, mussel, mozzarella', category: 'Pizza', imageUrl: 'https://example.com/img/pizza_seafood.jpg' },
      { name: 'Pizza Truffle Mushroom', price: 159000, description: 'Mushroom, truffle oil, mozzarella', category: 'Pizza', imageUrl: 'https://example.com/img/pizza_truffle.jpg' },
      { name: 'Classic Beef Burger', price: 89000, description: 'Beef patty, cheddar, lettuce, tomato', category: 'Burger', imageUrl: 'https://example.com/img/burger_classic.jpg' },
      { name: 'Cheese Burger', price: 95000, description: 'Beef patty, double cheese, pickle', category: 'Burger', imageUrl: 'https://example.com/img/burger_cheese.jpg' },
      { name: 'BBQ Bacon Burger', price: 109000, description: 'Beef, bacon, BBQ sauce, onion rings', category: 'Burger', imageUrl: 'https://example.com/img/burger_bbq_bacon.jpg' },
      { name: 'Chicken Burger', price: 85000, description: 'Crispy chicken, mayo, lettuce', category: 'Burger', imageUrl: 'https://example.com/img/burger_chicken.jpg' },
      { name: 'Mushroom Swiss Burger', price: 105000, description: 'Beef, sautéed mushrooms, swiss cheese', category: 'Burger', imageUrl: 'https://example.com/img/burger_mushroom_swiss.jpg' },
      { name: 'Spicy Jalapeno Burger', price: 99000, description: 'Beef, jalapeno, pepper jack', category: 'Burger', imageUrl: 'https://example.com/img/burger_spicy.jpg' },
      { name: 'Salmon Nigiri Set', price: 119000, description: 'Fresh salmon nigiri 6 pcs', category: 'Sushi', imageUrl: 'https://example.com/img/sushi_salmon.jpg' },
      { name: 'Tuna Nigiri Set', price: 125000, description: 'Tuna nigiri 6 pcs', category: 'Sushi', imageUrl: 'https://example.com/img/sushi_tuna.jpg' },
      { name: 'California Roll', price: 99000, description: 'Crab stick, avocado, cucumber', category: 'Sushi', imageUrl: 'https://example.com/img/sushi_california.jpg' },
      { name: 'Philadelphia Roll', price: 115000, description: 'Salmon, cream cheese, avocado', category: 'Sushi', imageUrl: 'https://example.com/img/sushi_philadelphia.jpg' },
      { name: 'Tempura Roll', price: 109000, description: 'Shrimp tempura, eel sauce', category: 'Sushi', imageUrl: 'https://example.com/img/sushi_tempura.jpg' },
      { name: 'Dragon Roll', price: 129000, description: 'Eel, avocado, cucumber', category: 'Sushi', imageUrl: 'https://example.com/img/sushi_dragon.jpg' },
      { name: 'Rainbow Roll', price: 139000, description: 'Assorted fish, avocado', category: 'Sushi', imageUrl: 'https://example.com/img/sushi_rainbow.jpg' },
      { name: 'Veggie Roll', price: 85000, description: 'Cucumber, carrot, avocado', category: 'Sushi', imageUrl: 'https://example.com/img/sushi_veggie.jpg' },
      { name: 'Beef Pho', price: 85000, description: 'Vietnamese beef noodle soup', category: 'Noodles', imageUrl: 'https://example.com/img/noodles_beef_pho.jpg' },
      { name: 'Chicken Pho', price: 79000, description: 'Vietnamese chicken noodle soup', category: 'Noodles', imageUrl: 'https://example.com/img/noodles_chicken_pho.jpg' },
      { name: 'Spicy Ramen', price: 99000, description: 'Pork broth, chili oil, egg', category: 'Noodles', imageUrl: 'https://example.com/img/noodles_spicy_ramen.jpg' },
      { name: 'Tonkotsu Ramen', price: 115000, description: 'Rich pork bone broth ramen', category: 'Noodles', imageUrl: 'https://example.com/img/noodles_tonkotsu.jpg' },
      { name: 'Pad Thai Shrimp', price: 105000, description: 'Stir-fried rice noodles with shrimp', category: 'Noodles', imageUrl: 'https://example.com/img/noodles_padthai.jpg' },
      { name: 'Udon Beef', price: 99000, description: 'Udon with sliced beef & broth', category: 'Noodles', imageUrl: 'https://example.com/img/noodles_udon_beef.jpg' },
      { name: 'Grilled Chicken Rice', price: 89000, description: 'Grilled chicken thigh on rice', category: 'Rice Bowl', imageUrl: 'https://example.com/img/rice_grilled_chicken.jpg' },
      { name: 'Beef Teriyaki Rice', price: 109000, description: 'Beef teriyaki with steamed rice', category: 'Rice Bowl', imageUrl: 'https://example.com/img/rice_beef_teriyaki.jpg' },
      { name: 'Pork Katsu Don', price: 99000, description: 'Pork cutlet, egg, onion over rice', category: 'Rice Bowl', imageUrl: 'https://example.com/img/rice_katsu_don.jpg' },
      { name: 'Bibimbap', price: 99000, description: 'Korean mixed rice with veggies', category: 'Rice Bowl', imageUrl: 'https://example.com/img/rice_bibimbap.jpg' },
      { name: 'Curry Rice Chicken', price: 95000, description: 'Japanese curry with chicken', category: 'Rice Bowl', imageUrl: 'https://example.com/img/rice_curry_chicken.jpg' },
      { name: 'Curry Rice Beef', price: 109000, description: 'Japanese curry with beef', category: 'Rice Bowl', imageUrl: 'https://example.com/img/rice_curry_beef.jpg' },
      { name: 'Iced Lemon Tea', price: 35000, description: 'Refreshing iced lemon tea', category: 'Beverage', imageUrl: 'https://example.com/img/drink_lemon_tea.jpg' },
      { name: 'Iced Milk Tea', price: 39000, description: 'Classic milk tea with ice', category: 'Beverage', imageUrl: 'https://example.com/img/drink_milk_tea.jpg' },
      { name: 'Fresh Orange Juice', price: 45000, description: 'Freshly squeezed orange', category: 'Beverage', imageUrl: 'https://example.com/img/drink_orange.jpg' },
      { name: 'Vietnamese Iced Coffee', price: 39000, description: 'Robusta coffee with condensed milk', category: 'Beverage', imageUrl: 'https://example.com/img/drink_vn_iced_coffee.jpg' },
      { name: 'Americano (Iced)', price: 49000, description: 'Iced americano coffee', category: 'Beverage', imageUrl: 'https://example.com/img/drink_americano.jpg' },
      { name: 'Latte', price: 59000, description: 'Cafe latte', category: 'Beverage', imageUrl: 'https://example.com/img/drink_latte.jpg' },
      { name: 'Sparkling Water', price: 25000, description: 'Carbonated mineral water', category: 'Beverage', imageUrl: 'https://example.com/img/drink_sparkling.jpg' },
      { name: 'Yogurt Smoothie', price: 55000, description: 'Yogurt fruit smoothie', category: 'Beverage', imageUrl: 'https://example.com/img/drink_yogurt_smoothie.jpg' },
      { name: 'Chocolate Brownie', price: 49000, description: 'Fudgy chocolate brownie', category: 'Dessert', imageUrl: 'https://example.com/img/dessert_brownie.jpg' },
      { name: 'Cheesecake', price: 59000, description: 'Creamy baked cheesecake', category: 'Dessert', imageUrl: 'https://example.com/img/dessert_cheesecake.jpg' },
      { name: 'Tiramisu', price: 59000, description: 'Classic Italian tiramisu', category: 'Dessert', imageUrl: 'https://example.com/img/dessert_tiramisu.jpg' },
      { name: 'Panna Cotta', price: 52000, description: 'Vanilla panna cotta', category: 'Dessert', imageUrl: 'https://example.com/img/dessert_pannacotta.jpg' },
      { name: 'Creme Brulee', price: 59000, description: 'Caramelized custard dessert', category: 'Dessert', imageUrl: 'https://example.com/img/dessert_creme_brulee.jpg' },
      { name: 'Matcha Lava Cake', price: 65000, description: 'Warm cake with matcha lava', category: 'Dessert', imageUrl: 'https://example.com/img/dessert_matcha_lava.jpg' },
      { name: 'Fruit Salad', price: 45000, description: 'Seasonal fruit mix', category: 'Dessert', imageUrl: 'https://example.com/img/dessert_fruit_salad.jpg' },
      { name: 'Mango Sticky Rice', price: 59000, description: 'Thai mango sticky rice', category: 'Dessert', imageUrl: 'https://example.com/img/dessert_mango_sticky.jpg' },
    ].map(x => ({ ...x, restaurantId, createdAt: now, updatedAt: now }))

    await queryInterface.bulkInsert('Menu', rows);
  },

  down: async (queryInterface, Sequelize) => {
    // delete the seeded rows by name
    await queryInterface.bulkDelete('Menu', {
      name: [
        'Pizza Margherita','Pizza Pepperoni','Pizza Hawaiian','Pizza Four Cheese','Pizza BBQ Chicken','Pizza Veggie','Pizza Seafood','Pizza Truffle Mushroom',
        'Classic Beef Burger','Cheese Burger','BBQ Bacon Burger','Chicken Burger','Mushroom Swiss Burger','Spicy Jalapeno Burger',
        'Salmon Nigiri Set','Tuna Nigiri Set','California Roll','Philadelphia Roll','Tempura Roll','Dragon Roll','Rainbow Roll','Veggie Roll',
        'Beef Pho','Chicken Pho','Spicy Ramen','Tonkotsu Ramen','Pad Thai Shrimp','Udon Beef',
        'Grilled Chicken Rice','Beef Teriyaki Rice','Pork Katsu Don','Bibimbap','Curry Rice Chicken','Curry Rice Beef',
        'Iced Lemon Tea','Iced Milk Tea','Fresh Orange Juice','Vietnamese Iced Coffee','Americano (Iced)','Latte','Sparkling Water','Yogurt Smoothie',
        'Chocolate Brownie','Cheesecake','Tiramisu','Panna Cotta','Creme Brulee','Matcha Lava Cake','Fruit Salad','Mango Sticky Rice'
      ]
    });
  }
};
