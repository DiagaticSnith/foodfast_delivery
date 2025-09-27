const express = require('express');
const router = express.Router();
const { getMenus, createMenu } = require('../controllers/menuController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', getMenus);
router.post('/', authMiddleware, createMenu);

module.exports = router;