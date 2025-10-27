const { Restaurant, Menu } = require('../models');

module.exports = {
  async getAll(req, res) {
    try {
  const { includeHidden, status, userId } = req.query;
  const baseWhere = status ? { status } : (includeHidden ? {} : { status: 'active' });
  const where = userId ? { ...baseWhere, userId: Number(userId) } : baseWhere;
  const menuWhere = status ? { status } : (includeHidden ? undefined : { status: 'active' });
  const restaurants = await Restaurant.findAll({ where, include: { model: Menu, where: menuWhere, required: false } });
      res.json(restaurants);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
  const { includeHidden, status } = req.query;
  const menuWhere = status ? { status } : (includeHidden ? undefined : { status: 'active' });
  const restaurant = await Restaurant.findByPk(req.params.id, { include: { model: Menu, where: menuWhere, required: false } });
      if (!restaurant) return res.status(404).json({ error: 'Not found' });
      res.json(restaurant);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async create(req, res) {
    try {
      const restaurant = await Restaurant.create(req.body);
      res.status(201).json(restaurant);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id);
      if (!restaurant) return res.status(404).json({ error: 'Not found' });
      await restaurant.update(req.body);
      res.json(restaurant);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id);
      if (!restaurant) return res.status(404).json({ error: 'Not found' });
      await restaurant.update({ status: 'hidden' });
      res.json({ message: 'Hidden' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
