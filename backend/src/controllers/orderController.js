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


  return assignedDroneId;
}

// Export helper for testing
exports.autoAssignDroneForOrder = autoAssignDroneForOrder;

// Lấy tất cả đơn hàng (admin hoặc nhà hàng với filter)
exports.getAllOrders = async (req, res) => {
  try {
    const { Drone, User, OrderDetail, Menu } = require('../models');
    const { restaurantId } = req.query;
    
    // Build include options
    const includeOptions = [
      { model: Drone, attributes: ['id', 'name'] },
      { model: User, attributes: ['id', 'username', 'email', 'role', 'name', 'address', 'phoneNumber'] },
      { 
        model: OrderDetail, 
        attributes: ['id', 'menuId', 'quantity', 'price'], 
        include: [
          { model: Menu, attributes: ['id', 'name', 'restaurantId'] }
        ] 
      }
    ];
    
    let orders = await Order.findAll({ 
      include: includeOptions,
      order: [['createdAt', 'DESC']]
    });
    
    // Nếu có restaurantId, filter đơn hàng theo nhà hàng
    if (restaurantId) {
      orders = orders.filter(order => {
        // Kiểm tra xem có OrderDetail nào thuộc nhà hàng này không
        if (!order.OrderDetails || order.OrderDetails.length === 0) return false;
        return order.OrderDetails.some(od => 
          od.Menu && od.Menu.restaurantId === parseInt(restaurantId)
        );
      });
    }
    
    res.json(orders);
  } catch (err) {
    console.error('getAllOrders error:', err);
    res.status(500).json({ message: err.message });
  }
}


exports.createOrder = async (req, res) => {
  try {
    const { userId, total, address, items, sessionId } = req.body;
    // Luôn tạo đơn với status 'Chưa giao'
  const order = await Order.create({ userId, total, address, status: 'Pending', sessionId });
    // Business metric: increment orders created via API
    try {
      const { ordersCreated } = require('../metrics');
      if (ordersCreated && typeof ordersCreated.labels === 'function') ordersCreated.labels('api').inc();
    } catch (e) {
      console.warn('Could not increment ordersCreated metric', e && e.message);
    }
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
    if (!['Pending', 'Accepted', 'Delivering', 'Done', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    const oldStatus = order.status;
    order.status = status;
    await order.save();
    
    // Nếu đơn chuyển sang Done -> giải phóng drone
    if (status === 'Done' && order.droneId && oldStatus !== 'Done') {
      const { Drone } = require('../models');
      const drone = await Drone.findByPk(order.droneId);
      if (drone && drone.status !== 'available') {
        drone.status = 'available';
        await drone.save();
        console.log(`Drone #${order.droneId} released after completing order #${order.id}`);
      }
    }
    
    // Nếu nhà hàng xác nhận ('Accepted') -> tự động gán drone nếu có sẵn
    if (status === 'Accepted' && !order.droneId) {
      try {
        const droneId = await autoAssignDroneForOrder(order.id);
        if (!droneId) {
          return res.json({ message: 'Đã xác nhận đơn. Hiện chưa có drone trống, hệ thống sẽ thử lại sau.', order });
        }
        return res.json({ message: `Đã xác nhận và gán drone #${droneId} cho đơn hàng.`, order: await Order.findByPk(order.id) });
      } catch (e) {
        if (e && e.code === 'NO_DRONE') {
          return res.json({ message: 'Đã xác nhận đơn. Chưa có drone available.', order });
        }
        return res.status(500).json({ message: 'Lỗi khi tự gán drone', error: e.message });
      }
    }
    // Nếu chuyển sang Delivering, chỉ trả về message xác nhận
    if (status === 'Delivering') {
      return res.json({ message: 'Đơn đang giao tới khách hàng', order });
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
    // Persist the rejection reason into the order.description field
    order.description = reason || null;
    await order.save();
    return res.json({ message: 'Đã từ chối đơn', order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};