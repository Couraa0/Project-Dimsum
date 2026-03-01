const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

router.get('/', categoryController.getAll);
router.get('/admin', protect, categoryController.getAllAdmin);
router.post('/', protect, categoryController.create);
router.patch('/:id', protect, categoryController.update);
router.delete('/:id', protect, categoryController.delete);

module.exports = router;
