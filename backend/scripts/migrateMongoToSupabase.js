const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { PrismaClient } = require('@prisma/client');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_URL = process.env.DATABASE_URL;

if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI tidak ditemukan di file .env');
    process.exit(1);
}

if (!DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL (Supabase) tidak ditemukan di file .env');
    console.log('Silakan tambahkan DATABASE_URL ke file backend/.env sebelum menjalankan script ini.');
    process.exit(1);
}

// Inisialisasi Mongoose Models
// Kita definisikan schema secara inline agar script ini mandiri dan tidak tergantung path model
const adminSchema = new mongoose.Schema({}, { strict: false, collection: 'admins' });
const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const categorySchema = new mongoose.Schema({}, { strict: false, collection: 'categories' });
const menuItemSchema = new mongoose.Schema({}, { strict: false, collection: 'menuitems' });
const tableSchema = new mongoose.Schema({}, { strict: false, collection: 'tables' });
const orderSchema = new mongoose.Schema({}, { strict: false, collection: 'orders' });

const MongoAdmin = mongoose.model('MongoAdmin', adminSchema);
const MongoUser = mongoose.model('MongoUser', userSchema);
const MongoCategory = mongoose.model('MongoCategory', categorySchema);
const MongoMenuItem = mongoose.model('MongoMenuItem', menuItemSchema);
const MongoTable = mongoose.model('MongoTable', tableSchema);
const MongoOrder = mongoose.model('MongoOrder', orderSchema);

const prisma = new PrismaClient();

async function migrate() {
    try {
        console.log('🔌 Menghubungkan ke MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Terhubung ke MongoDB.');

        console.log('🔌 Menghubungkan ke Supabase...');
        await prisma.$connect();
        console.log('✅ Terhubung ke Supabase.');

        // 1. Bersihkan database Supabase terlebih dahulu untuk menghindari konflik
        console.log('\n🧹 Membersihkan data lama di Supabase...');
        await prisma.orderItem.deleteMany({});
        await prisma.order.deleteMany({});
        await prisma.table.deleteMany({});
        await prisma.menuItem.deleteMany({});
        await prisma.category.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.admin.deleteMany({});
        console.log('✅ Supabase siap dimigrasi.');

        // 2. Migrasi Admins
        console.log('\n👥 Memulai migrasi Admin...');
        const mongoAdmins = await MongoAdmin.find({}).lean();
        console.log(`Menemukan ${mongoAdmins.length} admin di MongoDB.`);
        for (const admin of mongoAdmins) {
            await prisma.admin.create({
                data: {
                    id: admin._id.toString(),
                    name: admin.name || 'Admin',
                    email: admin.email,
                    password: admin.password,
                    role: admin.role || 'admin',
                    isActive: admin.isActive !== undefined ? admin.isActive : true,
                    lastLogin: admin.lastLogin ? new Date(admin.lastLogin) : null,
                    createdAt: admin.createdAt ? new Date(admin.createdAt) : new Date(),
                    updatedAt: admin.updatedAt ? new Date(admin.updatedAt) : new Date()
                }
            });
        }
        console.log(`✅ Berhasil memigrasi ${mongoAdmins.length} admin.`);

        // 3. Migrasi Users
        console.log('\n👤 Memulai migrasi User...');
        const mongoUsers = await MongoUser.find({}).lean();
        console.log(`Menemukan ${mongoUsers.length} user di MongoDB.`);
        for (const user of mongoUsers) {
            await prisma.user.create({
                data: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    password: user.password || null,
                    googleId: user.googleId || null,
                    avatar: user.avatar || null,
                    role: user.role || 'user',
                    isActive: user.isActive !== undefined ? user.isActive : true,
                    lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
                    createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                    updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
                }
            });
        }
        console.log(`✅ Berhasil memigrasi ${mongoUsers.length} user.`);

        // 4. Migrasi Categories
        console.log('\n📂 Memulai migrasi Kategori...');
        const mongoCategories = await MongoCategory.find({}).lean();
        console.log(`Menemukan ${mongoCategories.length} kategori di MongoDB.`);
        const categoryIds = new Set();
        for (const cat of mongoCategories) {
            const catId = cat._id.toString();
            categoryIds.add(catId);
            await prisma.category.create({
                data: {
                    id: catId,
                    name: cat.name,
                    slug: cat.slug,
                    icon: cat.icon || '🥟',
                    description: cat.description || '',
                    order: cat.order || 0,
                    isActive: cat.isActive !== undefined ? cat.isActive : true,
                    createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
                    updatedAt: cat.updatedAt ? new Date(cat.updatedAt) : new Date()
                }
            });
        }
        console.log(`✅ Berhasil memigrasi ${mongoCategories.length} kategori.`);

        // 5. Migrasi MenuItems
        console.log('\n🍔 Memulai migrasi Menu Item...');
        const mongoMenuItems = await MongoMenuItem.find({}).lean();
        console.log(`Menemukan ${mongoMenuItems.length} menu item di MongoDB.`);
        const menuItemIds = new Set();
        for (const item of mongoMenuItems) {
            const itemId = item._id.toString();
            menuItemIds.add(itemId);

            // Filter relasi kategori yang valid
            const cats = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);
            const validCategoryConnections = [];
            for (const catRef of cats) {
                const catStr = catRef.toString();
                if (categoryIds.has(catStr)) {
                    validCategoryConnections.push({ id: catStr });
                }
            }

            await prisma.menuItem.create({
                data: {
                    id: itemId,
                    name: item.name,
                    description: item.description || '',
                    price: Number(item.price),
                    image: item.image || '',
                    isBestSeller: item.isBestSeller || false,
                    isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
                    stock: item.stock !== undefined ? Number(item.stock) : 100,
                    totalOrdered: item.totalOrdered !== undefined ? Number(item.totalOrdered) : 0,
                    tags: Array.isArray(item.tags) ? item.tags : [],
                    categories: {
                        connect: validCategoryConnections
                    },
                    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
                    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date()
                }
            });
        }
        console.log(`✅ Berhasil memigrasi ${mongoMenuItems.length} menu item.`);

        // 6. Migrasi Tables
        console.log('\n🪑 Memulai migrasi Meja...');
        const mongoTables = await MongoTable.find({}).lean();
        console.log(`Menemukan ${mongoTables.length} meja di MongoDB.`);
        const tableIds = new Set();
        for (const table of mongoTables) {
            tableIds.add(table._id.toString());
            await prisma.table.create({
                data: {
                    id: table._id.toString(),
                    number: table.number,
                    name: table.name || `Meja ${table.number}`,
                    capacity: table.capacity !== undefined ? Number(table.capacity) : 4,
                    qrCode: table.qrCode || '',
                    isActive: table.isActive !== undefined ? table.isActive : true,
                    status: table.status || 'available',
                    currentOrderId: null, // Kita hubungkan setelah Order diimpor untuk menghindari pelanggaran FK
                    createdAt: table.createdAt ? new Date(table.createdAt) : new Date(),
                    updatedAt: table.updatedAt ? new Date(table.updatedAt) : new Date()
                }
            });
        }
        console.log(`✅ Berhasil memigrasi ${mongoTables.length} meja.`);

        // 7. Migrasi Orders & OrderItems
        console.log('\n📦 Memulai migrasi Order & Order Item...');
        const mongoOrders = await MongoOrder.find({}).lean();
        console.log(`Menemukan ${mongoOrders.length} order di MongoDB.`);
        let orderCount = 0;
        
        // Buat dummy menu item untuk menangani menu item lama yang sudah dihapus namun ada di history order
        const checkAndCreateDummyMenu = async (id, name) => {
            if (!menuItemIds.has(id)) {
                console.log(`⚠️  Membuat menu dummy untuk item yang dihapus: ID ${id} (${name})`);
                await prisma.menuItem.create({
                    data: {
                        id,
                        name: `${name} (Terhapus)`,
                        description: 'Menu ini telah dihapus dari sistem namun tercatat di riwayat transaksi.',
                        price: 0,
                        image: '',
                        isAvailable: false,
                        stock: 0
                    }
                });
                menuItemIds.add(id);
            }
        };

        for (const order of mongoOrders) {
            const orderId = order._id.toString();
            
            // Siapkan detail customer
            const customer = order.customer || {};

            // Validasi relasi ke meja
            let tableId = order.table ? order.table.toString() : null;
            if (tableId && !tableIds.has(tableId)) {
                console.log(`⚠️  Meja dengan ID ${tableId} untuk Order ${order.orderNumber || orderId} tidak ditemukan di database. Mengosongkan relasi meja.`);
                tableId = null;
            }

            // Proses order items
            const items = order.items || [];
            const processedItems = [];
            for (const item of items) {
                const menuItemId = item.menuItem ? item.menuItem.toString() : null;
                if (!menuItemId) continue;

                // Pastikan menu item id ada (atau buat dummy jika tidak ada)
                await checkAndCreateDummyMenu(menuItemId, item.name || 'Menu Tidak Diketahui');

                processedItems.push({
                    id: item._id ? item._id.toString() : new mongoose.Types.ObjectId().toString(),
                    menuItemId: menuItemId,
                    name: item.name || 'Menu Item',
                    price: Number(item.price) || 0,
                    quantity: Number(item.quantity) || 1,
                    subtotal: Number(item.subtotal) || 0,
                    notes: item.notes || ''
                });
            }

            // Buat order
            await prisma.order.create({
                data: {
                    id: orderId,
                    orderNumber: order.orderNumber || null,
                    type: order.type || 'dine-in',
                    status: order.status || 'pending',
                    subtotal: Number(order.subtotal) || 0,
                    tax: Number(order.tax) || 0,
                    total: Number(order.total) || 0,
                    paymentMethod: order.paymentMethod || 'cash',
                    paymentStatus: order.paymentStatus || 'unpaid',
                    tableNumber: order.tableNumber || null,
                    tableId: tableId,
                    customerName: customer.name || 'Guest',
                    customerPhone: customer.phone || '',
                    customerAddress: customer.address || '',
                    customerNotes: customer.notes || '',
                    estimatedTime: order.estimatedTime !== undefined ? Number(order.estimatedTime) : 15,
                    items: {
                        create: processedItems
                    },
                    createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
                    updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date()
                }
            });
            orderCount++;
        }
        console.log(`✅ Berhasil memigrasi ${orderCount} order.`);

        // 8. Hubungkan relasi Meja -> currentOrderId
        console.log('\n🔄 Menyinkronkan status currentOrderId meja...');
        for (const table of mongoTables) {
            if (table.currentOrderId) {
                const currentOrderIdStr = table.currentOrderId.toString();
                // Verifikasi order ada di Supabase
                const orderExists = await prisma.order.findUnique({ where: { id: currentOrderIdStr } });
                if (orderExists) {
                    await prisma.table.update({
                        where: { id: table._id.toString() },
                        data: { currentOrderId: currentOrderIdStr }
                    });
                }
            }
        }
        console.log('✅ Status currentOrderId meja berhasil disinkronkan.');

        console.log('\n🎉 SEMUA DATA BERHASIL DIMIGRASI KE SUPABASE! 🎉');
        process.exit(0);
    } catch (err) {
        console.error('❌ Terjadi kesalahan pada proses migrasi:', err);
        process.exit(1);
    }
}

migrate();
