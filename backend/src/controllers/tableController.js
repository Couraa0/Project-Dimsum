const Table = require('../models/Table');
const Order = require('../models/Order');
const QRCode = require('qrcode');

const generateQR = async (tableNumber, baseUrl) => {
    const url = `${baseUrl}/dinein?meja=${String(tableNumber).padStart(2, '0')}`;
    return await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#C1121F', light: '#FFFFFF' } });
};

exports.getTables = async (req, res) => {
    try {
        const tables = await Table.find().sort({ number: 1 });
        res.json({ success: true, data: tables });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTableByNumber = async (req, res) => {
    try {
        const table = await Table.findOne({ number: req.params.number, isActive: true });
        if (!table) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan' });
        const activeOrders = await Order.find({ tableNumber: req.params.number, status: { $nin: ['delivered', 'cancelled'] } }).sort({ createdAt: -1 });
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
        const table = await Table.create({ number: String(number).padStart(2, '0'), name: name || `Meja ${number}`, capacity: capacity || 4, qrCode });
        res.status(201).json({ success: true, data: table });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ success: false, message: 'Nomor meja sudah ada' });
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateTable = async (req, res) => {
    try {
        const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!table) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan' });
        res.json({ success: true, data: table });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.regenerateQR = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);
        if (!table) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan' });
        const baseUrl = req.body.baseUrl || req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000';
        table.qrCode = await generateQR(table.number, baseUrl);
        await table.save();
        res.json({ success: true, data: table, message: 'QR Code berhasil digenerate ulang' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteTable = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);
        if (!table) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan' });
        if (table.status === 'occupied') return res.status(400).json({ success: false, message: 'Meja sedang digunakan, tidak bisa dihapus' });
        await table.deleteOne();
        res.json({ success: true, message: 'Meja berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
