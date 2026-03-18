const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/google', userController.googleLogin);
router.get('/me', protect, userController.getMe);

router.get('/', protect, userController.getAll);
router.patch('/:id/role', protect, userController.updateRole);
router.delete('/:id', protect, userController.deleteUser);

module.exports = router;
