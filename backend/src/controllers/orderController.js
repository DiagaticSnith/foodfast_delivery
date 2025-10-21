// Lưu ý: PoC mới - drone tự gán, admin không còn gán thủ công.
exports.assignDrone = async (req, res) => {
  return res.status(410).json({ message: 'Deprecated: Drone sẽ tự động gán khi nhà hàng xác nhận đơn.' });
}
exports.assignShipper = async (req, res) => {
  return res.status(410).json({ message: 'Deprecated: Hệ thống không dùng shipper trong PoC này.' });
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
const { sequelize } = require('../config/db');
const { Order, Drone } = require('../models');

// Helper: tự động gán 1 drone available cho đơn hàng khi nhà hàng xác nhận
async function autoAssignDroneForOrder(orderId) {
  let assignedDroneId = null;
  await sequelize.transaction(async (t) => {
    // Khóa hàng của đơn để tránh race khi nhiều tiến trình
    const order = await Order.findByPk(orderId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!order) throw new Error('Order not found');
    if (order.droneId) {
      assignedDroneId = order.droneId;
      return; // đã có drone
    }
    // Tìm 1 drone available và khóa record
    const drone = await Drone.findOne({ where: { status: 'available' }, transaction: t, lock: t.LOCK.UPDATE });
    if (!drone) throw Object.assign(new Error('No available drone'), { code: 'NO_DRONE' });
    drone.status = 'busy';
    await drone.save({ transaction: t });
    order.droneId = drone.id;
    order.status = 'Accepted';
    await order.save({ transaction: t });
    assignedDroneId = drone.id;
  });

  // Sau khi gán thành công: PoC tự động release drone sau 10s và đánh dấu đơn hoàn tất
  if (assignedDroneId) {
    setTimeout(async () => {
      try {
        const o = await Order.findByPk(orderId);
        if (o && o.status !== 'Done') {
          o.status = 'Done';
          await o.save();
        }
        const d = await Drone.findByPk(assignedDroneId);
        if (d) {
          d.status = 'available';
          await d.save();
        }
      } catch (e) {
        console.error('Auto release drone error:', e);
      }
    }, 10000);
  }

  return assignedDroneId;
}

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
    if (!['Pending', 'Accepted', 'Done', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    await order.save();
    // Nếu nhà hàng xác nhận ('Accepted') -> tự động gán drone nếu có sẵn
    if (status === 'Accepted' && !order.droneId) {
      try {
        const droneId = await autoAssignDroneForOrder(order.id);
        if (!droneId) {
          return res.json({ message: 'Đã xác nhận đơn. Hiện chưa có drone trống, hệ thống sẽ thử lại sau.', order });
        }
        return res.json({ message: `Đã xác nhận và gán drone #${droneId}. Drone sẽ hoàn tất trong ~10s (PoC).`, order: await Order.findByPk(order.id) });
      } catch (e) {
        if (e && e.code === 'NO_DRONE') {
          return res.json({ message: 'Đã xác nhận đơn. Chưa có drone available.', order });
        }
        return res.status(500).json({ message: 'Lỗi khi tự gán drone', error: e.message });
      }
    }
    return res.json({ message: 'Cập nhật trạng thái thành công', order });
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

// Nhà hàng từ chối đơn (ghi lại lý do nếu có)
exports.rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = 'Rejected';
    await order.save();
    // TODO: có thể lưu reason vào bảng riêng hoặc field ghi chú nếu schema hỗ trợ
    return res.json({ message: 'Đã từ chối đơn', order, reason: reason || null });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};