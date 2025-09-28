const express = require('express');
const router = express.Router();
const { handleCheckoutSuccess } = require('../controllers/checkoutSuccessController');

router.get('/success', handleCheckoutSuccess);

module.exports = router;
