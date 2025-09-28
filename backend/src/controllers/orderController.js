const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// Lấy order theo session_id Stripe
exports.getOrderBySessionId = async (req, res) => {
  console.log('[DEBUG] Đã vào getOrderBySessionId, req.params:', req.params);
  try {
    const { sessionId } = req.params;
    console.log('[DEBUG] sessionId nhận từ client:', sessionId, '| typeof:', typeof sessionId);
    // Tìm order theo sessionId Stripe
    let order = await Order.findOne({ where: { sessionId: sessionId } });
    if (!order) {
      console.error('[DEBUG] Không tìm thấy đơn hàng với sessionId:', sessionId);
      // Log toàn bộ bảng Orders để kiểm tra sessionId thực tế trong DB
      const allOrders = await Order.findAll({ order: [['createdAt', 'DESC']] });
      console.error('[DEBUG] Tất cả đơn hàng (sessionId):', allOrders.map(o => ({id: o.id, sessionId: o.sessionId, userId: o.userId, total: o.total, createdAt: o.createdAt})));
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    console.log('[DEBUG] Đơn hàng tìm được:', order.toJSON ? order.toJSON() : order);
    res.json(order);
  } catch (err) {
    console.error('[DEBUG] Lỗi khi truy vấn order theo sessionId:', err);
    res.status(400).json({ message: err.message });
  }
};
const { Order } = require('../models');

// Lấy tất cả đơn hàng (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.createOrder = async (req, res) => {
  try {
    const { userId, total, address, items, status, sessionId } = req.body;
    // Tạo order với status và sessionId nếu có
    const order = await Order.create({ userId, total, address, status: status || 'Unpaid', sessionId });
    // Tạo orderdetails nếu có items
    if (Array.isArray(items) && items.length > 0) {
      const { OrderDetail } = require('../models');
      for (const item of items) {
        await OrderDetail.create({
          orderId: order.id,
          menuId: item.menuId,
          quantity: item.quantity,
          price: item.price
        });
      }
    }
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    console.log('getUserOrders userId:', req.params.userId);
    const orders = await Order.findAll({ where: { userId: req.params.userId } });
    console.log('getUserOrders result:', orders);
    res.json(orders); // Trả về mảng rỗng nếu không có đơn
  } catch (err) {
    console.error('getUserOrders error:', err);
    res.status(400).json({ message: err.message });
  }
};