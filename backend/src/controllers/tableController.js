const prisma = require('../utils/prisma');
const QRCode = require('qrcode');
const { randomUUID } = require('crypto');

const generateQR = async (tableNumber, baseUrl) => {
    const url = `${baseUrl}/dinein?meja=${String(tableNumber).padStart(2, '0')}`;
    return await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#C1121F', light: '#FFFFFF' } });
};

exports.getTables = async (req, res) => {
    try {
        const tables = await prisma.table.findMany({ orderBy: { number: 'asc' } });
        res.json({ success: true, data: tables });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTableByNumber = async (req, res) => {
    try {
        const table = await prisma.table.findFirst({
            where: { number: req.params.number, isActive: true }
        });
        if (!table) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan' });
        const activeOrders = await prisma.order.findMany({
            where: {
                tableNumber: req.params.number,
                status: { notIn: ['delivered', 'cancelled'] }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: table, activeOrders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createTable = async (req, res) => {
    try {
        const { number, name, capacity, baseUrl: clientBaseUrl } = req.body;
        const baseUrl = clientBaseUrl || req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000';
        const qrCode = await generateQR(number, baseUrl);
        const formattedNumber = String(number).padStart(2, '0');
        const table = await prisma.table.create({
            data: {
                id: randomUUID(),
                number: formattedNumber,
                name: name || `Meja ${number}`,
                capacity: capacity ? Number(capacity) : 4,
                qrCode
            }
        });
        res.status(201).json({ success: true, data: table });
    } catch (err) {
        if (err.code === 'P2002') return res.status(400).json({ success: false, message: 'Nomor meja sudah ada' });
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateTable = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.capacity !== undefined) data.capacity = Number(data.capacity);
        if (data.isActive !== undefined) data.isActive = data.isActive === 'true' || data.isActive === true;

        const table = await prisma.table.update({
            where: { id: req.params.id },
            data
        });
        res.json({ success: true, data: table });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.regenerateQR = async (req, res) => {
    try {
        const table = await prisma.table.findUnique({ where: { id: req.params.id } });
        if (!table) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan' });
        const baseUrl = req.body.baseUrl || req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000';
        const qrCode = await generateQR(table.number, baseUrl);
        
        const updated = await prisma.table.update({
            where: { id: req.params.id },
            data: { qrCode }
        });
        res.json({ success: true, data: updated, message: 'QR Code berhasil digenerate ulang' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteTable = async (req, res) => {
    try {
        const table = await prisma.table.findUnique({ where: { id: req.params.id } });
        if (!table) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan' });
        if (table.status === 'occupied') return res.status(400).json({ success: false, message: 'Meja sedang digunakan, tidak bisa dihapus' });
        
        await prisma.table.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Meja berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
