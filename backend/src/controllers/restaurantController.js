const { Restaurant, Menu } = require('../models');

module.exports = {
  async getAll(req, res) {
    try {
      const { includeHidden, status, userId } = req.query;
      // coerce includeHidden to boolean when passed as query param
      const includeHiddenFlag = includeHidden === 'true' || includeHidden === true;
      const baseWhere = status ? { status } : (includeHiddenFlag ? {} : { status: 'active' });
      // coerce userId to number if present
      const userIdNum = userId ? Number(userId) : undefined;
      const where = typeof userIdNum === 'number' && !Number.isNaN(userIdNum) ? { ...baseWhere, userId: userIdNum } : baseWhere;
      const menuWhere = status ? { status } : (includeHiddenFlag ? undefined : { status: 'active' });

      // Build include and avoid passing `where: undefined` to Sequelize
      const menuInclude = { model: Menu, required: false };
      // only set where when it has keys (avoid passing empty object)
      if (menuWhere && Object.keys(menuWhere).length > 0) menuInclude.where = menuWhere;

      const restaurants = await Restaurant.findAll({ where, include: [menuInclude] });
      res.json(restaurants);
    } catch (err) {
      console.error('restaurantController.getAll error:', err);
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const { includeHidden, status } = req.query;
      const includeHiddenFlag = includeHidden === 'true' || includeHidden === true;
      const menuWhere = status ? { status } : (includeHiddenFlag ? undefined : { status: 'active' });

  const menuInclude = { model: Menu, required: false };
  if (menuWhere && Object.keys(menuWhere).length > 0) menuInclude.where = menuWhere;

      const restaurant = await Restaurant.findByPk(req.params.id, { include: [menuInclude] });
      if (!restaurant) return res.status(404).json({ error: 'Not found' });
      res.json(restaurant);
    } catch (err) {
      console.error('restaurantController.getById error:', err);
      res.status(500).json({ error: err.message });
    }
  },
  async create(req, res) {
    try {
      // If caller provided a userId (user registering their restaurant), default to 'pending'
      // Admin-created restaurants (no userId) will remain 'active' by default.
      const payload = { ...req.body };
      if (!payload.status) {
        payload.status = payload.userId ? 'pending' : 'active';
      }
      const restaurant = await Restaurant.create(payload);
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
