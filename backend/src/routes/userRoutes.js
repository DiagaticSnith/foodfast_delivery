const express = require('express');
const router = express.Router();
const { register, login, getAllUsers, updateUserRole, updateUserInfo, getShippersAndPending, getUserById } = require('../controllers/userController');
// Lấy danh sách shipper và shipperpending
router.get('/shippers', getShippersAndPending);
// Cập nhật thông tin cá nhân (address, phoneNumber)
router.put('/:id/info', updateUserInfo);
// Đổi role cho user (user có thể đăng ký shipper)
router.put('/:id/role', updateUserRole);
// Lấy user theo id (thông tin công khai cơ bản)
router.get('/:id', getUserById);
// Lấy tất cả user (admin)
router.get('/', getAllUsers);

router.post('/register', register);
router.post('/login', login);

module.exports = router;