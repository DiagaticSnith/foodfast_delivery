const { Review, User, Menu, sequelize } = require('../models');

exports.listForMenu = async (req, res, next) => {
  try {
    const menuId = Number(req.params.menuId);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const where = { menuId, status: 'approved' };
    if (req.user?.role === 'admin' && req.query.includePending === '1') delete where.status;

    const { rows, count } = await Review.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id','name','username'] }],
      order: [['createdAt','DESC']],
      limit, offset
    });

    const avgRes = await Review.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
      where: { menuId, status: 'approved' }
    });
    const avgRating = Number(parseFloat(avgRes?.get('avgRating') || 0).toFixed(2));

    res.json({ reviews: rows, count, page, limit, avgRating });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const menuId = Number(req.params.menuId);
    const userId = req.user.id;
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1..5' });
    if (comment && comment.length > 2000) return res.status(400).json({ message: 'Comment too long' });

    const existing = await Review.findOne({ where: { menuId, userId } });
    // If the user already posted a review for this menu, disallow posting again
    if (existing) {
      return res.status(400).json({ message: 'Bạn đã đánh giá món này rồi' });
    }

    const review = await Review.create({ menuId, userId, rating, comment, status: 'approved' });
    res.status(201).json(review);
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && req.user.id !== review.userId) return res.status(403).json({ message: 'No permission' });
    await review.destroy();
    res.json({ message: 'deleted' });
  } catch (err) { next(err); }
};

exports.setStatus = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const id = Number(req.params.id);
    const status = req.body.status;
    if (!['approved','pending','hidden'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    review.status = status;
    await review.save();
    res.json(review);
  } catch (err) { next(err); }
};

// List reviews written by a specific user. Admins can see all statuses; others only their own approved reviews.
exports.listForUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const where = { userId };
    // Non-admins can only see approved reviews (or their own reviews)
    if (req.user?.role !== 'admin') {
      if (req.user?.id === userId) {
        // allow the user to see their own reviews (all statuses)
      } else {
        where.status = 'approved';
      }
    }

    const reviews = await Review.findAll({ where, include: [{ model: Menu, attributes: ['id','name'] }], order: [['createdAt','DESC']] });
    res.json(reviews);
  } catch (err) { next(err); }
};
