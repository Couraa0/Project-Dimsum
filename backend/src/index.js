require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const tableRoutes = require('./routes/tables');

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Dimsum Ratu API is running 🥟', env: process.env.NODE_ENV }));

// Root handler
app.get('/', (req, res) => res.json({ success: true, message: 'Welcome to Dimsum Ratu Backend API! 🥟', docs: '/api/docs' }));

// 404 handler — Express v5: no wildcard '*' in app.use()
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// DB + Server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB Connected');
        await seedData();
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
        }
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
    });

module.exports = app;

async function seedData() {
    const Admin = require('./models/Admin');
    const Category = require('./models/Category');
    const MenuItem = require('./models/MenuItem');

    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
        await Admin.create({ name: 'Super Admin', email: 'admin@dimsumratu.com', password: 'admin123', role: 'superadmin' });
        console.log('👤 Default admin created: admin@dimsumratu.com / admin123');
    }

    const catCount = await Category.countDocuments();
    if (catCount === 0) {
        const categories = await Category.insertMany([
            { name: 'Dimsum Kukus', slug: 'dimsum-kukus', icon: '🥟', order: 1 },
            { name: 'Dimsum Goreng', slug: 'dimsum-goreng', icon: '🍤', order: 2 },
            { name: 'Paket Mix', slug: 'paket-mix', icon: '🎁', order: 3 },
            { name: 'Paket Hemat', slug: 'paket-hemat', icon: '💰', order: 4 },
            { name: 'Minuman', slug: 'minuman', icon: '🍵', order: 5 },
        ]);
        console.log('📂 Default categories created');

        const kukus = categories.find(c => c.slug === 'dimsum-kukus');
        const goreng = categories.find(c => c.slug === 'dimsum-goreng');
        const paketMix = categories.find(c => c.slug === 'paket-mix');
        const paketHemat = categories.find(c => c.slug === 'paket-hemat');
        const minuman = categories.find(c => c.slug === 'minuman');

        await MenuItem.insertMany([
            { name: 'Har Gow (Siomay Udang)', description: 'Dimsum kukus klasik berisi udang segar pilihan, dibungkus kulit tipis transparan', price: 28000, category: kukus._id, isBestSeller: true, totalOrdered: 520 },
            { name: 'Siu Mai', description: 'Siomay daging babi/ayam toping udang, tekstur kenyal lembut', price: 25000, category: kukus._id, isBestSeller: true, totalOrdered: 480 },
            { name: 'Cheung Fun Udang', description: 'Loh mai gai – bungkusan daun teratai berisi nasi ketan, ayam, dan jamur', price: 30000, category: kukus._id, totalOrdered: 310 },
            { name: 'Dimsum Ayam Jamur', description: 'Paduan daging ayam cincang dengan jamur shiitake pilihan', price: 22000, category: kukus._id, isBestSeller: false, totalOrdered: 280 },
            { name: 'Bakpao Merah', description: 'Roti kukus lembut berisi BBQ char siu atau kacang merah manis', price: 18000, category: kukus._id, totalOrdered: 240 },
            { name: 'Spring Roll Crispy', description: 'Lumpia goreng renyah berisi sayuran segar dan daging cincang', price: 20000, category: goreng._id, isBestSeller: true, totalOrdered: 410 },
            { name: 'Wonton Goreng', description: 'Wonton crispy digoreng keemasan, cocok dengan saus manis asam', price: 22000, category: goreng._id, totalOrdered: 290 },
            { name: 'Bola Wijen (Jin Deui)', description: 'Bola ketan goreng berisi pasta kacang merah, berlapis wijen harum', price: 18000, category: goreng._id, isBestSeller: true, totalOrdered: 350 },
            { name: 'Tahu Goreng Isi', description: 'Tahu goreng krispi berisi campuran udang dan sayuran segar', price: 20000, category: goreng._id, totalOrdered: 200 },
            { name: 'Paket Mix A – 4 Jenis', description: 'Kombinasi 4 jenis dimsum (2 kukus + 2 goreng), cocok untuk 2 orang', price: 75000, category: paketMix._id, isBestSeller: true, totalOrdered: 320 },
            { name: 'Paket Mix B – 6 Jenis', description: 'Kombinasi 6 jenis dimsum pilihan terbaik, cocok untuk 3-4 orang', price: 120000, category: paketMix._id, totalOrdered: 210 },
            { name: 'Paket Keluarga (10 Jenis)', description: 'Sajian lengkap 10 jenis dimsum untuk keluarga, nikmati bersama', price: 185000, category: paketMix._id, totalOrdered: 150 },
            { name: 'Paket Hemat A', description: 'Har Gow + Siu Mai + 1 minuman gratis, hemat 15%', price: 45000, category: paketHemat._id, isBestSeller: true, totalOrdered: 380 },
            { name: 'Paket Hemat Kantor', description: 'Paket 3 jenis dimsum + nasi + minuman, cocok untuk makan siang', price: 55000, category: paketHemat._id, totalOrdered: 260 },
            { name: 'Teh Jasmine (Hot/Ice)', description: 'Teh melati harum segar, minuman klasik pendamping dimsum', price: 12000, category: minuman._id, isBestSeller: true, totalOrdered: 560 },
            { name: 'Teh Oolong', description: 'Teh oolong semi-fermentasi aroma khas, cocok untuk dine-in', price: 15000, category: minuman._id, totalOrdered: 320 },
            { name: 'Jus Jeruk Segar', description: 'Perasan jeruk segar tanpa tambahan gula', price: 18000, category: minuman._id, totalOrdered: 280 },
            { name: 'Air Mineral', description: 'Air mineral botol 600ml', price: 8000, category: minuman._id, totalOrdered: 420 },
        ]);
        console.log('🍜 Default menu items created');
    }
}
