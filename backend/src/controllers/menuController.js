const MenuItem = require('../models/MenuItem');
const path = require('path');
const fs = require('fs');

exports.getAll = async (req, res) => {
    try {
        const { category, bestSeller, search } = req.query;
        const filter = { isAvailable: true };
        if (category) filter.category = category;
        if (bestSeller === 'true') filter.isBestSeller = true;
        if (search) filter.name = { $regex: search, $options: 'i' };
        const items = await MenuItem.find(filter).populate('category', 'name slug icon').sort({ totalOrdered: -1 });
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllAdmin = async (req, res) => {
    try {
        const { category, search } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (search) filter.name = { $regex: search, $options: 'i' };
        const items = await MenuItem.find(filter).populate('category', 'name slug icon').sort({ createdAt: -1 });
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id).populate('category', 'name slug icon');
        if (!item) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
        res.json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, description, price, category, isBestSeller, isAvailable, stock, tags } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : '';
        const item = await MenuItem.create({ name, description, price: Number(price), category, isBestSeller, isAvailable, stock: Number(stock) || 100, image, tags: tags ? tags.split(',').map(t => t.trim()) : [] });
        const populated = await item.populate('category', 'name slug icon');
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
        if (req.file) {
            if (item.image && fs.existsSync(path.join(__dirname, '../../', item.image))) {
                fs.unlinkSync(path.join(__dirname, '../../', item.image));
            }
            req.body.image = `/uploads/${req.file.filename}`;
        }
        if (req.body.tags && typeof req.body.tags === 'string') {
            req.body.tags = req.body.tags.split(',').map(t => t.trim());
        }
        const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('category', 'name slug icon');
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
        if (item.image && fs.existsSync(path.join(__dirname, '../../', item.image))) {
            fs.unlinkSync(path.join(__dirname, '../../', item.image));
        }
        await item.deleteOne();
        res.json({ success: true, message: 'Menu berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
