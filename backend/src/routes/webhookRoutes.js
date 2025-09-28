const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Webhook endpoint
router.post('/', webhookController.handleWebhook);

module.exports = router;
