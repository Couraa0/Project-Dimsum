const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const settingsController = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
    storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
        if (/jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
        else cb(new Error('Hanya file gambar yang diizinkan'));
    }
});

router.get('/', settingsController.getSettings);
router.patch('/', protect, restrictTo('admin'), upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'heroImage', maxCount: 1 }]), settingsController.updateSettings);

module.exports = router;
