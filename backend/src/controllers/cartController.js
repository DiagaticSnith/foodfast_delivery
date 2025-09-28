const { Cart, CartItem, Menu } = require('../models');

module.exports = {
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await Cart.findOne({
        where: { userId },
        include: [{ model: CartItem, include: [Menu] }]
      });
      res.json(cart || { items: [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const { menuId, quantity } = req.body;
      let cart = await Cart.findOne({ where: { userId } });
      if (!cart) cart = await Cart.create({ userId });
      let item = await CartItem.findOne({ where: { cartId: cart.id, menuId } });
      if (item) {
        item.quantity += quantity || 1;
        await item.save();
      } else {
        item = await CartItem.create({ cartId: cart.id, menuId, quantity: quantity || 1 });
      }
      res.json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async removeFromCart(req, res) {
    try {
      const userId = req.user.id;
      const { menuId } = req.body;
      const cart = await Cart.findOne({ where: { userId } });
      if (!cart) return res.status(404).json({ error: 'Cart not found' });
      await CartItem.destroy({ where: { cartId: cart.id, menuId } });
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async clearCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await Cart.findOne({ where: { userId } });
      if (!cart) return res.json({ success: true });
      await CartItem.destroy({ where: { cartId: cart.id } });
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
