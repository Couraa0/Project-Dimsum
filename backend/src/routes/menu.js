const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const menuController = require('../controllers/menuController');
const { protect } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
    storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
        if (/jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
        else cb(new Error('Hanya file gambar yang diizinkan'));
    }
});

router.get('/', menuController.getAll);
router.get('/admin', protect, menuController.getAllAdmin);
router.get('/:id', menuController.getById);
router.post('/', protect, upload.single('image'), menuController.create);
router.patch('/:id', protect, upload.single('image'), menuController.update);
router.delete('/:id', protect, menuController.delete);

module.exports = router;
