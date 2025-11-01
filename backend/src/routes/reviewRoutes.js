const express = require('express');
const router = express.Router();
const reviewCtrl = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');

router.get('/menus/:menuId/reviews', reviewCtrl.listForMenu);
router.get('/users/:userId/reviews', reviewCtrl.listForUser);
router.post('/menus/:menuId/reviews', authMiddleware, reviewCtrl.create);
router.delete('/reviews/:id', authMiddleware, reviewCtrl.delete);
router.put('/reviews/:id/status', authMiddleware, reviewCtrl.setStatus);

module.exports = router;
