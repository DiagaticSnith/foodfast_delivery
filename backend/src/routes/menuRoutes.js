const express = require('express');
const router = express.Router();
const { getMenus, createMenu, getMenuDetail } = require('../controllers/menuController');
const { authMiddleware } = require('../middleware/auth');


router.get('/', getMenus);
router.post('/', authMiddleware, createMenu);
router.get('/:id', getMenuDetail);

module.exports = router;