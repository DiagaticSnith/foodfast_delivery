const Menu = require('../models/Menu');
const { Op } = require('sequelize');

exports.getMenus = async (req, res) => {
  try {
    const { search } = req.query;
    let where = {};
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