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

exports.getByOrderNumber = async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber }).populate('items.menuItem', 'name image');
        if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan. Pastikan nomor pesanan benar.' });
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
        let startUTC, endUTC, targetDateStr;

        if (date) {
            targetDateStr = date;
            startUTC = new Date(`${date}T00:00:00+07:00`);
            endUTC = new Date(`${date}T23:59:59.999+07:00`);
        } else {
            const jktTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
            const d = new Date(jktTime);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            targetDateStr = `${y}-${m}-${day}`;
            startUTC = new Date(`${targetDateStr}T00:00:00+07:00`);
            endUTC = new Date(`${targetDateStr}T23:59:59.999+07:00`);
        }

        const [orders, totalRevenue, topItems] = await Promise.all([
            Order.find({ createdAt: { $gte: startUTC, $lte: endUTC }, status: { $ne: 'cancelled' } }),
            Order.aggregate([{ $match: { createdAt: { $gte: startUTC, $lte: endUTC }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
            Order.aggregate([
                { $match: { createdAt: { $gte: startUTC, $lte: endUTC }, status: { $ne: 'cancelled' } } },
                { $unwind: '$items' },
                { $group: { _id: '$items.menuItem', name: { $first: '$items.name' }, totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.subtotal' } } },
                { $sort: { totalQty: -1 } },
                { $limit: 5 }
            ])
        ]);

        res.json({
            success: true,
            data: {
                date: targetDateStr,
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
        let startDate, endDate;
        if (month) {
            const m = String(month).padStart(2, '0');
            startDate = new Date(`${year}-${m}-01T00:00:00+07:00`);
            const d = new Date(year, month, 0).getDate();
            endDate = new Date(`${year}-${m}-${d}T23:59:59.999+07:00`);
        } else {
            startDate = new Date(`${year}-01-01T00:00:00+07:00`);
            endDate = new Date(`${year}-12-31T23:59:59.999+07:00`);
        }

        const data = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: {
                        year: { $year: { date: '$createdAt', timezone: 'Asia/Jakarta' } },
                        month: { $month: { date: '$createdAt', timezone: 'Asia/Jakarta' } },
                        day: { $dayOfMonth: { date: '$createdAt', timezone: 'Asia/Jakarta' } }
                    },
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
