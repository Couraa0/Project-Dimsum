const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { protect } = require('../middleware/auth');

router.get('/', protect, tableController.getTables);
router.get('/:number/info', tableController.getTableByNumber);
router.post('/', protect, tableController.createTable);
router.patch('/:id', protect, tableController.updateTable);
router.post('/:id/regenerate-qr', protect, tableController.regenerateQR);
router.delete('/:id', protect, tableController.deleteTable);

module.exports = router;
