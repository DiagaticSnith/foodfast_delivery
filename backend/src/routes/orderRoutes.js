const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getOrderBySessionId, getAllOrders, assignShipper, assignDrone, updateOrderStatus } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');
// Cập nhật trạng thái đơn hàng (shipper xác nhận đã giao)
router.put('/:id', authMiddleware, updateOrderStatus);
// Admin gán shipper cho đơn hàng
router.put('/:id/assign-shipper', assignShipper);
// Admin gán drone cho đơn hàng
router.put('/:id/assign-drone', assignDrone);

// Lấy tất cả đơn hàng (admin)
router.get('/', getAllOrders);

router.post('/', authMiddleware, createOrder);
router.get('/by-session/:sessionId', getOrderBySessionId);
router.get('/:userId', authMiddleware, getUserOrders);

module.exports = router;