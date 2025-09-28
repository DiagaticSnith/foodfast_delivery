const { Restaurant, Menu } = require('../models');

module.exports = {
  async getAll(req, res) {
    try {
      const restaurants = await Restaurant.findAll({ include: Menu });
      res.json(restaurants);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, { include: Menu });
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
      await restaurant.destroy();
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
