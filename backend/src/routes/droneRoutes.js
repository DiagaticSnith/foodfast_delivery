const express = require('express');
const router = express.Router();
const { getAllDrones } = require('../controllers/droneController');

// Lấy tất cả drone
router.get('/', getAllDrones);

module.exports = router;
