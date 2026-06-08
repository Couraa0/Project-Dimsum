const prisma = require('../utils/prisma');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            orderBy: [{ order: 'asc' }, { name: 'asc' }]
        });
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllAdmin = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: [{ order: 'asc' }, { name: 'asc' }]
        });
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, icon, description, order } = req.body;
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const existing = await prisma.category.findUnique({ where: { slug } });
        if (existing) return res.status(400).json({ success: false, message: 'Kategori sudah ada' });
        
        const category = await prisma.category.create({
            data: {
                id: uuidv4(),
                name,
                slug,
                icon: icon || '🥟',
                description: description || '',
                order: order !== undefined ? Number(order) : 0
            }
        });
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.order !== undefined) data.order = Number(data.order);
        if (data.isActive !== undefined) data.isActive = data.isActive === 'true' || data.isActive === true;
        if (data.name) {
            data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }

        const category = await prisma.category.update({
            where: { id: req.params.id },
            data
        });
        res.json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const itemCount = await prisma.menuItem.count({
            where: {
                categories: {
                    some: {
                        id: req.params.id
                    }
                }
            }
        });
        if (itemCount > 0) return res.status(400).json({ success: false, message: `Kategori memiliki ${itemCount} menu. Hapus menu terlebih dahulu.` });
        
        await prisma.category.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Kategori berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
