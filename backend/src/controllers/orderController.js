const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');

exports.createOrder = async (req, res) => {
    try {
        const { type, items, paymentMethod, tableNumber, customer } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'Pesanan tidak boleh kosong' });

        let subtotal = 0;
        const populatedItems = [];
        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItemId);
            if (!menuItem || !menuItem.isAvailable) return res.status(400).json({ success: false, message: `Menu ${item.name || item.menuItemId} tidak tersedia` });
            const subtotalItem = menuItem.price * item.quantity;
            subtotal += subtotalItem;
            populatedItems.push({ menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: item.quantity, subtotal: subtotalItem, notes: item.notes || '' });
        }

        const tax = Math.round(subtotal * 0.0);
        const total = subtotal + tax;

        let tableRef = null;
        if (type === 'dine-in' && tableNumber) {
            const table = await Table.findOne({ number: tableNumber });
            if (table) { tableRef = table._id; table.status = 'occupied'; await table.save(); }
        }

        const order = await Order.create({ type, items: populatedItems, subtotal, tax, total, paymentMethod: paymentMethod || 'cash', tableNumber, table: tableRef, customer: customer || {} });

        for (const item of populatedItems) {
            await MenuItem.findByIdAndUpdate(item.menuItem, { $inc: { totalOrdered: item.quantity } });
        }

        res.status(201).json({ success: true, data: order, message: 'Pesanan berhasil dibuat!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const { status, type, date, tableNumber, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (tableNumber) filter.tableNumber = tableNumber;
        if (date) {
            const start = new Date(date); start.setHours(0, 0, 0, 0);
            const end = new Date(date); end.setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: start, $lte: end };
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [orders, total] = await Promise.all([
            Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            Order.countDocuments(filter)
        ]);
        res.json({ success: true, data: orders, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.menuItem', 'name image');
        if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

        if ((status === 'delivered' || status === 'cancelled') && order.table) {
            const pendingOrders = await Order.countDocuments({ table: order.table, status: { $nin: ['delivered', 'cancelled'] } });
            if (pendingOrders === 0) await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrderId: null });
        }
        res.json({ success: true, data: order, message: `Status pesanan diupdate menjadi ${status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updatePayment = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
        if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getDailyReport = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);
        const endDate = new Date(targetDate); endDate.setHours(23, 59, 59, 999);

        const [orders, totalRevenue, topItems] = await Promise.all([
            Order.find({ createdAt: { $gte: targetDate, $lte: endDate }, status: { $ne: 'cancelled' } }),
            Order.aggregate([{ $match: { createdAt: { $gte: targetDate, $lte: endDate }, status: { $ne: 'cancelled' }, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
            Order.aggregate([
                { $match: { createdAt: { $gte: targetDate, $lte: endDate }, status: { $ne: 'cancelled' } } },
                { $unwind: '$items' },
                { $group: { _id: '$items.menuItem', name: { $first: '$items.name' }, totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.subtotal' } } },
                { $sort: { totalQty: -1 } },
                { $limit: 5 }
            ])
        ]);

        res.json({
            success: true,
            data: {
                date: targetDate.toISOString().split('T')[0],
                totalOrders: orders.length,
                totalRevenue: totalRevenue[0]?.total || 0,
                byType: { 'dine-in': orders.filter(o => o.type === 'dine-in').length, 'takeaway': orders.filter(o => o.type === 'takeaway').length, 'delivery': orders.filter(o => o.type === 'delivery').length },
                topItems,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMonthlyReport = async (req, res) => {
    try {
        const { year = new Date().getFullYear(), month } = req.query;
        const startDate = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
        const endDate = month ? new Date(year, month, 0, 23, 59, 59) : new Date(year, 11, 31, 23, 59, 59);

        const data = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: { $ne: 'cancelled' } } },
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } }, totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$total' } } },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
