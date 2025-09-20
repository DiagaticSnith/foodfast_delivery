const { Order } = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { userId, total, address, items } = req.body;
    const order = await Order.create({ userId, total, address });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { userId: req.params.userId } });
    res.json(orders);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};