// Trigger nodemon restart
require('dotenv').config();
console.log('=== Environment Debug ===');
console.log('DATABASE_URL is defined:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL length:', process.env.DATABASE_URL.length);
    console.log('DATABASE_URL prefix:', process.env.DATABASE_URL.substring(0, 15) + '...');
}
console.log('Available Env Keys:', Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('PASSWORD') && !key.includes('KEY') && !key.includes('TOKEN') && !key.includes('URI')));
console.log('=========================');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');


const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
const backendUrl = process.env.BACKEND_URL || (isProduction ? 'https://dimsum-ratu-backend-h5dmd4gwf4dsd6a9.indonesiacentral-01.azurewebsites.net/api' : `http://localhost:${process.env.PORT || 5000}/api`);
swaggerDocument.servers = [
    {
        url: backendUrl,
        description: isProduction ? 'Production Server' : 'Local Server'
    }
];

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const tableRoutes = require('./routes/tables');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');
const testimonialRoutes = require('./routes/testimonials');

const performanceMonitor = require('./middleware/performance');


const app = express();

// Performance Monitoring
app.use(performanceMonitor);

// Middleware
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : 'http://localhost:3000';

app.use(compression());

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
}));
app.use(cors({
    origin: [frontendUrl, `${frontendUrl}/`],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware Kompatibilitas Frontend (MongoDB _id)
app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (obj) {
        const addUnderscoreId = (data) => {
            if (data === null || data === undefined) return data;
            if (data instanceof Date) return data;
            if (Buffer.isBuffer(data)) return data;
            if (Array.isArray(data)) {
                return data.map(addUnderscoreId);
            }
            if (typeof data === 'object') {
                const newObj = {};
                for (const key in data) {
                    newObj[key] = addUnderscoreId(data[key]);
                }
                if (data.id !== undefined && data._id === undefined) {
                    newObj._id = data.id;
                }
                return newObj;
            }
            return data;
        };
        if (obj && typeof obj === 'object') {
            obj = addUnderscoreId(obj);
        }
        return originalJson.call(this, obj);
    };
    next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger API Documentation
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCssUrl: CSS_URL,
    customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-standalone-preset.js'
    ]
}));

// Database connection logic for Serverless
const prisma = require('./utils/prisma');
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await prisma.$connect();
        isConnected = true;
        console.log('✅ Supabase Connected');
        seedData().catch(err => console.error('Seed error:', err));
    } catch (err) {
        console.error('❌ Supabase connection failed:', err.message);
        throw err;
    }
};

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Database connection error', detail: err.message });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/testimonials', testimonialRoutes);


// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Dimsum Ratu API is running 🥟', env: process.env.NODE_ENV }));

// Root handlerr
app.get('/', (req, res) => res.json({ success: true, message: 'Welcome to Dimsum Ratu Backend API! 🥟', docs: '/api/docs' }));
app.get('/api', (req, res) => res.json({ success: true, message: 'Welcome to Dimsum Ratu Backend API! 🥟', docs: '/api/docs' }));

// 404 handler — Express v5: no wildcard '*' in app.use()
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Server initialization for local development and non-Vercel environments (like Azure App Service)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    connectDB().then(() => {
        app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    });
}

module.exports = app;

async function seedData() {
    const prisma = require('./utils/prisma');
    const { v4: uuidv4 } = require('uuid');

    try {
        const catCount = await prisma.category.count();
        if (catCount === 0) {
            await prisma.category.createMany({
                data: [
                    { id: uuidv4(), name: 'Dimsum Kukus', slug: 'dimsum-kukus', icon: '🥟', order: 1 },
                    { id: uuidv4(), name: 'Dimsum Goreng', slug: 'dimsum-goreng', icon: '🍤', order: 2 },
                    { id: uuidv4(), name: 'Paket Mix', slug: 'paket-mix', icon: '🎁', order: 3 },
                    { id: uuidv4(), name: 'Minuman', slug: 'minuman', icon: '🍵', order: 4 },
                    { id: uuidv4(), name: 'Jus', slug: 'jus', icon: '🍹', order: 5 },
                    { id: uuidv4(), name: 'Coffee', slug: 'coffee', icon: '☕', order: 6 },
                    { id: uuidv4(), name: 'Cemilan', slug: 'cemilan', icon: '🍟', order: 7 },
                ]
            });
            console.log('📂 Default categories created');
        }

        const settingsCount = await prisma.storeSettings.count();
        if (settingsCount === 0) {
            await prisma.storeSettings.create({
                data: {
                    id: 'default',
                    storeName: 'Dimsum Ratu',
                    logo: '/logo.png',
                    address: 'Jl. Raya Karawang No. 88, Karawang Barat, Jawa Barat',
                    operatingHours: 'Setiap Hari: 10.00 – 21.00 WIB',
                    contact: '0878-7131-0560',
                    instagram: '@dimsumratu',
                    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63447.39099520374!2d107.27120727889587!3d-6.334154474228071!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6977baaaffcbfd%3A0x6d3a08c27370d633!2sDimsum%20Ratu%20Oishii!5e0!3m2!1sid!2sid!4v1772400307613!5m2!1sid!2sid',
                    facebookUrl: '#',
                    instagramUrl: '#',
                    tiktokUrl: '#'
                }
            });
            console.log('⚙️ Default store settings created');
        }

        const testimonialCount = await prisma.testimonial.count();
        if (testimonialCount === 0) {
            await prisma.testimonial.createMany({
                data: [
                    { id: uuidv4(), name: 'Siti Rahayu', role: 'Pelanggan Setia', text: 'Dimsum-nya enak banget! Har gow-nya lembut dan isian udaranya terasa segar. Sudah 3x order delivery, selalu on time dan panas!', rating: 5, avatar: '👩' },
                    { id: uuidv4(), name: 'Budi Santoso', role: 'Food Blogger', text: 'Kualitas rasa setara restoran, tapi harga sangat terjangkau. Paket mix-nya worth it banget untuk keluarga. Highly recommended!', rating: 5, avatar: '👨' },
                    { id: uuidv4(), name: 'Maya Putri', role: 'Ibu Rumah Tangga', text: 'QR code di meja keren banget, anak-anak senang pesan sendiri! Sistemnya mudah dan pesanan cepat datang. Pasti balik lagi!', rating: 5, avatar: '👩‍👧' },
                    { id: uuidv4(), name: 'Rudi Hermawan', role: 'Karyawan Swasta', text: 'Paket hemat kantor jadi andalan saya setiap hari Jumat. Porsinya pas, enak, dan pengirimannya cepat sampai kantor.', rating: 5, avatar: '👨' }
                ]
            });
            console.log('💬 Default testimonials seeded');
        }
    } catch (err) {
        console.error('Seed error:', err);
    }
}
