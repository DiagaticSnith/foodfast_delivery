const express = require('express');
const router = express.Router();
const { getOrderDetails } = require('../controllers/orderDetailController');

router.get('/:orderId', getOrderDetails);

module.exports = router;
