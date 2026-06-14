const prisma = require('../utils/prisma');
const { randomUUID } = require('crypto');

exports.createOrder = async (req, res) => {
    try {
        const { type, items, paymentMethod, tableNumber, customer } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'Pesanan tidak boleh kosong' });

        let subtotal = 0;
        const populatedItems = [];
        for (const item of items) {
            const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
            if (!menuItem || !menuItem.isAvailable) return res.status(400).json({ success: false, message: `Menu ${item.name || item.menuItemId} tidak tersedia` });
            const subtotalItem = menuItem.price * item.quantity;
            subtotal += subtotalItem;
            populatedItems.push({ menuItem: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: item.quantity, subtotal: subtotalItem, notes: item.notes || '' });
        }

        const tax = Math.round(subtotal * 0.0);
        const total = subtotal + tax;

        let tableRef = null;
        if (type === 'dine-in' && tableNumber) {
            const table = await prisma.table.findUnique({ where: { number: tableNumber } });
            if (table) {
                tableRef = table;
                await prisma.table.update({
                    where: { id: table.id },
                    data: { status: 'occupied' }
                });
            }
        }

        const count = await prisma.order.count();
        const date = new Date();
        const orderNumber = `DR${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`;

        const orderId = randomUUID();
        const order = await prisma.order.create({
            data: {
                id: orderId,
                orderNumber,
                type,
                subtotal,
                tax,
                total,
                paymentMethod: paymentMethod || 'cash',
                tableNumber,
                tableId: tableRef ? tableRef.id : null,
                customerName: customer?.name || 'Guest',
                customerPhone: customer?.phone || '',
                customerAddress: customer?.address || '',
                customerNotes: customer?.notes || '',
                items: {
                    create: populatedItems.map(item => ({
                        id: randomUUID(),
                        menuItemId: item.menuItem,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        subtotal: item.subtotal,
                        notes: item.notes
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        menuItem: {
                            select: { name: true, image: true }
                        }
                    }
                }
            }
        });

        // Increment totalOrdered for each menu item
        for (const item of populatedItems) {
            await prisma.menuItem.update({
                where: { id: item.menuItem },
                data: { totalOrdered: { increment: item.quantity } }
            });
        }

        // Return order and rename customer fields for compatibility
        const orderResponse = {
            ...order,
            customer: {
                name: order.customerName,
                phone: order.customerPhone,
                address: order.customerAddress,
                notes: order.customerNotes
            }
        };

        res.status(201).json({ success: true, data: orderResponse, message: 'Pesanan berhasil dibuat!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const { status, type, date, tableNumber, page = 1, limit = 20 } = req.query;
        const where = {};
        if (status) where.status = status;
        if (type) where.type = type;
        if (tableNumber) where.tableNumber = tableNumber;
        if (date) {
            const start = new Date(date); start.setHours(0, 0, 0, 0);
            const end = new Date(date); end.setHours(23, 59, 59, 999);
            where.createdAt = { gte: start, lte: end };
        }
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take,
                include: {
                    items: {
                        include: {
                            menuItem: {
                                select: { name: true, image: true }
                            }
                        }
                    }
                }
            }),
            prisma.order.count({ where })
        ]);

        const formattedOrders = orders.map(order => ({
            ...order,
            customer: {
                name: order.customerName,
                phone: order.customerPhone,
                address: order.customerAddress,
                notes: order.customerNotes
            }
        }));

        res.json({ success: true, data: formattedOrders, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: {
                items: {
                    include: {
                        menuItem: {
                            select: { name: true, image: true }
                        }
                    }
                }
            }
        });
        if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
        
        const orderResponse = {
            ...order,
            customer: {
                name: order.customerName,
                phone: order.customerPhone,
                address: order.customerAddress,
                notes: order.customerNotes
            }
        };
        res.json({ success: true, data: orderResponse });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getByOrderNumber = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { orderNumber: req.params.orderNumber },
            include: {
                items: {
                    include: {
                        menuItem: {
                            select: { name: true, image: true }
                        }
                    }
                }
            }
        });
        if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan. Pastikan nomor pesanan benar.' });
        
        const orderResponse = {
            ...order,
            customer: {
                name: order.customerName,
                phone: order.customerPhone,
                address: order.customerAddress,
                notes: order.customerNotes
            }
        };
        res.json({ success: true, data: orderResponse });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { status }
        });
        if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

        if ((status === 'delivered' || status === 'cancelled') && order.tableId) {
            const pendingOrders = await prisma.order.count({
                where: {
                    tableId: order.tableId,
                    status: { notIn: ['delivered', 'cancelled'] }
                }
            });
            if (pendingOrders === 0) {
                await prisma.table.update({
                    where: { id: order.tableId },
                    data: { status: 'available', currentOrderId: null }
                });
            }
        }
        res.json({ success: true, data: order, message: `Status pesanan diupdate menjadi ${status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updatePayment = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { paymentStatus }
        });
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

        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startUTC, lte: endUTC },
                status: { not: 'cancelled' }
            }
        });

        const revenueAgg = await prisma.order.aggregate({
            where: {
                createdAt: { gte: startUTC, lte: endUTC },
                status: { not: 'cancelled' }
            },
            _sum: {
                total: true
            }
        });

        const itemGroups = await prisma.orderItem.groupBy({
            by: ['menuItemId', 'name'],
            where: {
                order: {
                    createdAt: { gte: startUTC, lte: endUTC },
                    status: { not: 'cancelled' }
                }
            },
            _sum: {
                quantity: true,
                subtotal: true
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: 5
        });

        const topItems = itemGroups.map(item => ({
            _id: item.menuItemId,
            name: item.name,
            totalQty: item._sum.quantity || 0,
            totalRevenue: item._sum.subtotal || 0
        }));

        res.json({
            success: true,
            data: {
                date: targetDateStr,
                totalOrders: orders.length,
                totalRevenue: revenueAgg._sum.total || 0,
                byType: {
                    'dine-in': orders.filter(o => o.type === 'dine-in').length,
                    'takeaway': orders.filter(o => o.type === 'takeaway').length,
                    'delivery': orders.filter(o => o.type === 'delivery').length
                },
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

        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { not: 'cancelled' }
            },
            select: {
                createdAt: true,
                total: true
            }
        });

        const groups = {};
        for (const order of orders) {
            // konversi UTC ke timezone Jakarta (Asia/Jakarta = UTC+7)
            const localDate = new Date(order.createdAt.getTime() + 7 * 60 * 60 * 1000);
            const y = localDate.getUTCFullYear();
            const m = localDate.getUTCMonth() + 1;
            const d = localDate.getUTCDate();
            const key = `${y}-${m}-${d}`;
            if (!groups[key]) {
                groups[key] = {
                    _id: { year: y, month: m, day: d },
                    totalOrders: 0,
                    totalRevenue: 0
                };
            }
            groups[key].totalOrders += 1;
            groups[key].totalRevenue += order.total;
        }

        const data = Object.values(groups).sort((a, b) => {
            if (a._id.year !== b._id.year) return a._id.year - b._id.year;
            if (a._id.month !== b._id.month) return a._id.month - b._id.month;
            return a._id.day - b._id.day;
        });

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
