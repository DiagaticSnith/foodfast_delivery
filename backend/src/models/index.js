// models/index.js
const { sequelize } = require('../config/db');
const User = require('./User');
const Cart = require('./Cart');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');
const Menu = require('./Menu');
const CartItem = require('./CartItem');
const Restaurant = require('./Restaurant');
const Drone = require('./Drone');
const Review = require('./Review');

const db = {
  User,
  Cart,
  Order,
  OrderDetail,
  Menu,
  CartItem,
  Restaurant,
  Drone,
  Review,
};

// expose sequelize instance for controllers that need raw fn/col helpers
db.sequelize = sequelize;

Object.values(db).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(db);
  }
});

module.exports = db;
