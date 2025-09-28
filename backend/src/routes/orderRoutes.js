const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getOrderBySessionId, getAllOrders } = require('../controllers/orderController');

// Lấy tất cả đơn hàng (admin)
router.get('/', getAllOrders);
const { authMiddleware } = require('../middleware/auth');


router.post('/', authMiddleware, createOrder);
router.get('/by-session/:sessionId', getOrderBySessionId);
router.get('/:userId', authMiddleware, getUserOrders);

module.exports = router;