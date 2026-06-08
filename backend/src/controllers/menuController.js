const prisma = require('../utils/prisma');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../utils/supabase');

exports.getAll = async (req, res) => {
    try {
        const { category, bestSeller, search } = req.query;
        const where = { isAvailable: true };
        if (category) {
            const catArray = Array.isArray(category) ? category : category.split(',').filter(c => c.trim() !== '');
            where.categories = {
                some: {
                    id: { in: catArray }
                }
            };
        }
        if (bestSeller === 'true') where.isBestSeller = true;
        if (search) where.name = { contains: search, mode: 'insensitive' };
        const items = await prisma.menuItem.findMany({
            where,
            include: {
                categories: {
                    select: { id: true, name: true, slug: true, icon: true }
                }
            },
            orderBy: { totalOrdered: 'desc' }
        });
        
        // Kompatibilitas mundur dengan nama field 'category' untuk frontend
        const formattedItems = items.map(item => {
            const formatted = { ...item };
            formatted.category = item.categories;
            delete formatted.categories;
            return formatted;
        });
        res.json({ success: true, data: formattedItems });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllAdmin = async (req, res) => {
    try {
        const { category, search } = req.query;
        const where = {};
        if (category) {
            const catArray = Array.isArray(category) ? category : category.split(',').filter(c => c.trim() !== '');
            where.categories = {
                some: {
                    id: { in: catArray }
                }
            };
        }
        if (search) where.name = { contains: search, mode: 'insensitive' };
        const items = await prisma.menuItem.findMany({
            where,
            include: {
                categories: {
                    select: { id: true, name: true, slug: true, icon: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        const formattedItems = items.map(item => {
            const formatted = { ...item };
            formatted.category = item.categories;
            delete formatted.categories;
            return formatted;
        });
        res.json({ success: true, data: formattedItems });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const item = await prisma.menuItem.findUnique({
            where: { id: req.params.id },
            include: {
                categories: {
                    select: { id: true, name: true, slug: true, icon: true }
                }
            }
        });
        if (!item) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
        const formatted = { ...item };
        formatted.category = item.categories;
        delete formatted.categories;
        res.json({ success: true, data: formatted });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        let { name, description, price, category, isBestSeller, isAvailable, stock, tags } = req.body;
        // Simpan file gambar ke Supabase Storage jika diunggah
        let image = '';
        if (req.file) {
            const filename = `menu-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(req.file.originalname)}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('dimsum-images')
                .upload(filename, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false
                });

            if (uploadError) {
                console.error('Gagal mengunggah gambar ke Supabase:', uploadError.message);
                throw new Error('Gagal mengunggah gambar: ' + uploadError.message);
            }

            const { data: publicUrlData } = supabase.storage
                .from('dimsum-images')
                .getPublicUrl(filename);
                
            image = publicUrlData.publicUrl;
        }
        
        // Handle categories as array
        if (category && typeof category === 'string') {
            category = category.split(',').filter(c => c.trim() !== '');
        }
        const catIds = Array.isArray(category) ? category : (category ? [category] : []);

        const item = await prisma.menuItem.create({ 
            data: {
                id: uuidv4(),
                name, 
                description: description || '', 
                price: Number(price), 
                isBestSeller: isBestSeller === 'true' || isBestSeller === true, 
                isAvailable: isAvailable === 'true' || isAvailable === true, 
                stock: Number(stock) || 100, 
                image, 
                tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [],
                categories: {
                    connect: catIds.map(id => ({ id }))
                }
            },
            include: {
                categories: {
                    select: { id: true, name: true, slug: true, icon: true }
                }
            }
        });
        
        const formatted = { ...item };
        formatted.category = item.categories;
        delete formatted.categories;
        res.status(201).json({ success: true, data: formatted });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const item = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
        if (!item) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
        
        const data = {};
        if (req.body.name !== undefined) data.name = req.body.name;
        if (req.body.description !== undefined) data.description = req.body.description;
        if (req.body.price !== undefined) data.price = Number(req.body.price);
        if (req.body.stock !== undefined) data.stock = Number(req.body.stock);
        if (req.body.totalOrdered !== undefined) data.totalOrdered = Number(req.body.totalOrdered);

        if (req.file) {
            // Hapus file gambar lama jika ada
            if (item.image) {
                if (item.image.includes('supabase.co/storage/v1/object/public/dimsum-images/')) {
                    const oldFilename = item.image.split('/').pop();
                    if (oldFilename) {
                        await supabase.storage.from('dimsum-images').remove([oldFilename]);
                    }
                } else if (item.image.startsWith('/uploads/')) {
                    const oldImagePath = path.join(__dirname, '../../', item.image);
                    try {
                        if (fs.existsSync(oldImagePath)) await fs.promises.unlink(oldImagePath);
                    } catch (err) {
                        console.error('Gagal menghapus file gambar lama:', err.message);
                    }
                }
            }

            // Simpan gambar baru ke Supabase Storage
            const filename = `menu-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(req.file.originalname)}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('dimsum-images')
                .upload(filename, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false
                });

            if (uploadError) {
                console.error('Gagal mengunggah gambar ke Supabase:', uploadError.message);
                throw new Error('Gagal mengunggah gambar: ' + uploadError.message);
            }

            const { data: publicUrlData } = supabase.storage
                .from('dimsum-images')
                .getPublicUrl(filename);
                
            data.image = publicUrlData.publicUrl;
        } else if (req.body.image !== undefined) {
            data.image = req.body.image;
        }
        
        if (req.body.isBestSeller !== undefined) data.isBestSeller = req.body.isBestSeller === 'true' || req.body.isBestSeller === true;
        if (req.body.isAvailable !== undefined) data.isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;
        
        if (req.body.tags !== undefined) {
            const tags = req.body.tags;
            data.tags = tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [];
        }

        if (req.body.category !== undefined) {
            let category = req.body.category;
            if (category && typeof category === 'string') {
                category = category.split(',').filter(c => c.trim() !== '');
            }
            const catIds = Array.isArray(category) ? category : (category ? [category] : []);
            data.categories = {
                set: catIds.map(id => ({ id }))
            };
        }
        
        const updated = await prisma.menuItem.update({
            where: { id: req.params.id },
            data,
            include: {
                categories: {
                    select: { id: true, name: true, slug: true, icon: true }
                }
            }
        });
        
        const formatted = { ...updated };
        formatted.category = updated.categories;
        delete formatted.categories;
        res.json({ success: true, data: formatted });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const item = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
        if (!item) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
        
        // Hapus file gambar dari Supabase atau lokal jika ada
        if (item.image) {
            if (item.image.includes('supabase.co/storage/v1/object/public/dimsum-images/')) {
                const filename = item.image.split('/').pop();
                if (filename) {
                    await supabase.storage.from('dimsum-images').remove([filename]);
                }
            } else if (item.image.startsWith('/uploads/')) {
                const imagePath = path.join(__dirname, '../../', item.image);
                try {
                    if (fs.existsSync(imagePath)) await fs.promises.unlink(imagePath);
                } catch (err) {
                    console.error('Gagal menghapus file gambar menu:', err.message);
                }
            }
        }
        
        await prisma.menuItem.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Menu berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
