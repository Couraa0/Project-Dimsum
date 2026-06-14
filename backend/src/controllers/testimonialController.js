const prisma = require('../utils/prisma');
const { randomUUID } = require('crypto');

exports.getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: testimonials });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createTestimonial = async (req, res) => {
    try {
        const { name, role, text, rating, avatar } = req.body;
        if (!name || !role || !text) {
            return res.status(400).json({ success: false, message: 'Nama, Peran (Role), dan Testimoni wajib diisi' });
        }

        const testimonial = await prisma.testimonial.create({
            data: {
                id: randomUUID(),
                name,
                role,
                text,
                rating: rating !== undefined ? parseInt(rating) : 5,
                avatar: avatar || '👩'
            }
        });

        res.status(201).json({ success: true, message: 'Testimoni berhasil ditambahkan', data: testimonial });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, text, rating, avatar } = req.body;

        const existing = await prisma.testimonial.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Testimoni tidak ditemukan' });
        }

        const updated = await prisma.testimonial.update({
            where: { id },
            data: {
                name: name !== undefined ? name : existing.name,
                role: role !== undefined ? role : existing.role,
                text: text !== undefined ? text : existing.text,
                rating: rating !== undefined ? parseInt(rating) : existing.rating,
                avatar: avatar !== undefined ? avatar : existing.avatar
            }
        });

        res.json({ success: true, message: 'Testimoni berhasil diperbarui', data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await prisma.testimonial.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Testimoni tidak ditemukan' });
        }

        await prisma.testimonial.delete({ where: { id } });
        res.json({ success: true, message: 'Testimoni berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
