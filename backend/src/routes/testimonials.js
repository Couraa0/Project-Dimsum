const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', testimonialController.getAllTestimonials);
router.post('/', protect, restrictTo('admin'), testimonialController.createTestimonial);
router.patch('/:id', protect, restrictTo('admin'), testimonialController.updateTestimonial);
router.delete('/:id', protect, restrictTo('admin'), testimonialController.deleteTestimonial);

module.exports = router;
