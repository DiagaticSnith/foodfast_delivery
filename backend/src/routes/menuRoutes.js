const express = require('express');
const router = express.Router();
const { getMenus, createMenu, getMenuDetail, updateMenu, deleteMenu } = require('../controllers/menuController');
const { authMiddleware } = require('../middleware/auth');


router.get('/', getMenus);
router.post('/', authMiddleware, createMenu);
router.get('/:id', getMenuDetail);
router.put('/:id', authMiddleware, updateMenu);
router.delete('/:id', authMiddleware, deleteMenu);

module.exports = router;