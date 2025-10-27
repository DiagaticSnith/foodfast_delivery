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
  const { name, email, address, phoneNumber } = req.body;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (address !== undefined) user.address = address;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  await user.save();
  res.json({ message: 'User info updated', user: { id: user.id, username: user.username, name: user.name, email: user.email, address: user.address, phoneNumber: user.phoneNumber, role: user.role } });
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
    // Chỉ cho phép chuyển sang restaurantpending hoặc restaurant, user, admin
    if (role === 'restaurantpending') {
      user.role = 'restaurantpending';
    } else if (role === 'restaurant' || role === 'user' || role === 'admin') {
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
  const users = await User.findAll({ attributes: ['id', 'username', 'email', 'role', 'name', 'address', 'phoneNumber'] });
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
    let { username, password, email, name } = req.body;
    // Basic validation
    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ username, email và password' });
    }
    username = String(username).trim();
    email = String(email).trim().toLowerCase();
    name = name ? String(name).trim() : null;

    // Check duplicates early for clear error messages
    const existed = await User.findOne({ where: { username } });
    if (existed) return res.status(400).json({ message: 'Tên đăng nhập đã được sử dụng' });
    const existedEmail = await User.findOne({ where: { email } });
    if (existedEmail) return res.status(400).json({ message: 'Email đã được sử dụng' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, email, name, role: 'user' });
    res.status(201).json({ id: user.id, username: user.username, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    const msg = err?.name === 'SequelizeUniqueConstraintError' ? 'Tài khoản đã tồn tại' : (err?.message || 'Đăng ký thất bại');
    res.status(400).json({ message: msg });
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
  res.json({ message: 'Login success', token, user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role, address: user.address, phoneNumber: user.phoneNumber } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};