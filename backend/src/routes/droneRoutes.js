const express = require('express');
const router = express.Router();
const { getAllDrones, createDrone } = require('../controllers/droneController');

// Lấy tất cả drone
router.get('/', getAllDrones);
// Thêm drone mới
router.post('/', createDrone);

module.exports = router;
