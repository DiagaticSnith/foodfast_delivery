const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, createOrder);
router.get('/:userId', authMiddleware, getUserOrders);

module.exports = router;