const express = require('express');
const router = express.Router();
const { getAllDrones, createDrone, updateDrone, deleteDrone } = require('../controllers/droneController');

// Lấy tất cả drone
router.get('/', getAllDrones);
// Thêm drone mới
router.post('/', createDrone);
// Cập nhật drone theo id
router.put('/:id', updateDrone);
// Xoá drone theo id
router.delete('/:id', deleteDrone);

module.exports = router;
