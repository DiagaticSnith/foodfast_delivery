// Admin gán drone cho đơn hàng
exports.assignDrone = async (req, res) => {
  try {
    const { id } = req.params; // order id
    const { droneId } = req.body;
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.droneId = droneId;
    await order.save();
    res.json({ message: 'Drone assigned', order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
// Admin gán shipper cho đơn hàng
exports.assignShipper = async (req, res) => {
  try {
    const { id } = req.params; // order id
    const { shipperId } = req.body;
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.shipperId = shipperId;
    await order.save();
    res.json({ message: 'Shipper assigned', order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
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
    const { Drone, User, OrderDetail, Menu } = require('../models');
    const orders = await Order.findAll({
      include: [
        { model: Drone, attributes: ['id', 'name'] },
  { model: User, attributes: ['id', 'username', 'email', 'role', 'name'] },
        { model: OrderDetail, attributes: ['id', 'menuId', 'quantity', 'price'], include: [
          { model: Menu, attributes: ['id', 'name'] }
        ] }
      ]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


exports.createOrder = async (req, res) => {
  try {
    const { userId, total, address, items, sessionId } = req.body;
    // Luôn tạo đơn với status 'Chưa giao'
  const order = await Order.create({ userId, total, address, status: 'Pending', sessionId });
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

// API cập nhật trạng thái đơn hàng (chỉ cho phép 'Chưa giao' hoặc 'Đã giao')
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Pending', 'Accepted', 'Done'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    await order.save();
    res.json({ message: 'Cập nhật trạng thái thành công', order });
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