const MenuItem = require('../models/MenuItem');
const path = require('path');
const fs = require('fs');

exports.getAll = async (req, res) => {
    try {
        const { category, bestSeller, search } = req.query;
        const filter = { isAvailable: true };
        if (category) {
            const catArray = Array.isArray(category) ? category : category.split(',').filter(c => c.trim() !== '');
            filter.category = { $in: catArray };
        }
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
        if (category) {
            const catArray = Array.isArray(category) ? category : category.split(',').filter(c => c.trim() !== '');
            filter.category = { $in: catArray };
        }
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
        let { name, description, price, category, isBestSeller, isAvailable, stock, tags } = req.body;
        // Convert memory buffer to Base64 String
        const image = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : '';
        
        // Handle categories as array
        if (category && typeof category === 'string') {
            category = category.split(',').filter(c => c.trim() !== '');
        }

        const item = await MenuItem.create({ 
            name, 
            description, 
            price: Number(price), 
            category: Array.isArray(category) ? category : [category], 
            isBestSeller: isBestSeller === 'true' || isBestSeller === true, 
            isAvailable: isAvailable === 'true' || isAvailable === true, 
            stock: Number(stock) || 100, 
            image, 
            tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [] 
        });
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
            // Re-upload image as Base64 format and just overwrite the old local path/base64
            req.body.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }
        
        if (req.body.category && typeof req.body.category === 'string') {
            req.body.category = req.body.category.split(',').filter(c => c.trim() !== '');
        }

        if (req.body.tags && typeof req.body.tags === 'string') {
            req.body.tags = req.body.tags.split(',').map(t => t.trim());
        }

        // Clean up boolean strings
        if (req.body.isBestSeller !== undefined) req.body.isBestSeller = req.body.isBestSeller === 'true' || req.body.isBestSeller === true;
        if (req.body.isAvailable !== undefined) req.body.isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;
        
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
        
        await item.deleteOne();
        res.json({ success: true, message: 'Menu berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
