// Lấy danh sách shipper và shipperpending
exports.getShippersAndPending = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: ['shipper', 'shipperpending'] },
      attributes: ['id', 'username', 'email', 'address', 'phoneNumber', 'role']
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Cập nhật thông tin cá nhân (address, phoneNumber)
exports.updateUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { address, phoneNumber } = req.body;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.address = address;
    user.phoneNumber = phoneNumber;
    await user.save();
    res.json({ message: 'User info updated', user: { id: user.id, username: user.username, email: user.email, address: user.address, phoneNumber: user.phoneNumber, role: user.role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// Đổi role cho user (user có thể đăng ký shipper hoặc admin duyệt/từ chối shipper)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Nếu user đăng ký shipper, chỉ cho phép chuyển sang 'shipperpending'
    if (role === 'shipperpending') {
      user.role = 'shipperpending';
    } else if (role === 'shipper' || role === 'user' || role === 'admin') {
      // Admin duyệt hoặc từ chối
      user.role = role;
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
    await user.save();
    res.json({ message: 'Role updated', user: { id: user.id, username: user.username, email: user.email, address: user.address, phoneNumber: user.phoneNumber, role: user.role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// Lấy tất cả user (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'email', 'role'] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, email, role });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login success', token, user: { id: user.id, username: user.username, email: user.email, role: user.role, address: user.address, phoneNumber: user.phoneNumber } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};