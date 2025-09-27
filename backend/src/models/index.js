// models/index.js
const User = require('./User');
const Cart = require('./Cart');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');
const Menu = require('./Menu');
const CartItem = require('./CartItem');

const db = {
  User,
  Cart,
  Order,
  OrderDetail,
  Menu,
  CartItem,
};

// Gọi associate cho từng model nếu có
Object.values(db).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(db);
  }
});

module.exports = db;
