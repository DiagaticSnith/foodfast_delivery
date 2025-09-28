const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

router.get('/', restaurantController.getAll);
router.get('/:id', restaurantController.getById);
router.post('/', restaurantController.create);
router.put('/:id', restaurantController.update);
router.delete('/:id', restaurantController.delete);

module.exports = router;
