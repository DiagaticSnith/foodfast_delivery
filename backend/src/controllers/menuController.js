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