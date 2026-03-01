const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', orderController.createOrder);
router.get('/', protect, orderController.getOrders);
router.get('/report/daily', protect, orderController.getDailyReport);
router.get('/report/monthly', protect, orderController.getMonthlyReport);
router.get('/track/:orderNumber', orderController.getByOrderNumber);
router.get('/:id', protect, orderController.getOrderById);
router.patch('/:id/status', protect, orderController.updateStatus);
router.patch('/:id/payment', protect, orderController.updatePayment);

module.exports = router;
