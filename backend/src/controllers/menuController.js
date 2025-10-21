const Menu = require('../models/Menu');
const { Op } = require('sequelize');

exports.getMenus = async (req, res) => {
  try {
    const { search, restaurantId, includeHidden, status } = req.query;
    let where = {};
    if (status) {
      where.status = status;
    } else if (!includeHidden) {
      where.status = 'active';
    }
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }
    if (search && search.trim() !== '') {
      where.name = { [Op.like]: `%${search}%` };
    }
    const menus = await Menu.findAll({ where });
    res.json(menus);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.createMenu = async (req, res) => {
  try {
    const menu = await Menu.create(req.body);
    res.status(201).json(menu);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMenuDetail = async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Not found' });
    // Lấy các món liên quan cùng nhà hàng
    const related = await Menu.findAll({
      where: {
        restaurantId: menu.restaurantId,
        id: { [Op.ne]: menu.id },
        name: { [Op.ne]: menu.name }
      },
      limit: 3
    });
    res.json({ menu, related });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Not found' });
    await menu.update(req.body);
    res.json(menu);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Not found' });
    // Soft delete: set status to hidden
    await menu.update({ status: 'hidden' });
    res.json({ message: 'Hidden' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};