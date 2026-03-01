const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

exports.getAll = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllAdmin = async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1, name: 1 });
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, icon, description, order } = req.body;
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const existing = await Category.findOne({ slug });
        if (existing) return res.status(400).json({ success: false, message: 'Kategori sudah ada' });
        const category = await Category.create({ name, slug, icon, description, order });
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
        res.json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const itemCount = await MenuItem.countDocuments({ category: req.params.id });
        if (itemCount > 0) return res.status(400).json({ success: false, message: `Kategori memiliki ${itemCount} menu. Hapus menu terlebih dahulu.` });
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Kategori berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
