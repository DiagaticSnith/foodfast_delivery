const { Op } = require('sequelize');
// Use models index to be able to include Restaurant when querying menus
const { Menu, Restaurant } = require('../models');

exports.getMenus = async (req, res) => {
  try {
    const { search, restaurantId, includeHidden, status } = req.query;
    const includeHiddenFlag = includeHidden === 'true' || includeHidden === true;
    let where = {};
    if (status) {
      where.status = status;
    } else if (!includeHiddenFlag) {
      where.status = 'active';
    }
    if (restaurantId) {
      const restaurantIdNum = Number(restaurantId);
      if (!Number.isNaN(restaurantIdNum)) {
        where.restaurantId = restaurantIdNum;
      }
    }
    if (search && search.trim() !== '') {
      where.name = { [Op.like]: `%${search}%` };
    }
  // Exclude menus whose restaurant is hidden unless includeHiddenFlag is true
  const restaurantWhere = includeHiddenFlag ? undefined : { status: 'active' };

  const include = [];
  // include restaurant and optionally filter by its status
  const restaurantInclude = { model: Restaurant, required: true };
  if (restaurantWhere && Object.keys(restaurantWhere).length > 0) restaurantInclude.where = restaurantWhere;
  include.push(restaurantInclude);

  const menus = await Menu.findAll({ where, include });
    res.json(menus);
  } catch (err) {
    console.error('menuController.getMenus error:', err);
    // unexpected server error
    res.status(500).json({ message: err.message });
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
    console.error('menuController.getMenuDetail error:', err);
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
    console.error('menuController.updateMenu error:', err);
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
    console.error('menuController.deleteMenu error:', err);
    res.status(400).json({ message: err.message });
  }
};