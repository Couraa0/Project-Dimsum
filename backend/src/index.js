// Trigger nodemon restart
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

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
swaggerDocument.servers = [
    {
        url: isProduction ? 'https://dimsum-backend.vercel.app/api' : `http://localhost:${process.env.PORT || 5000}/api`,
        description: isProduction ? 'Production Server' : 'Local Server'
    }
];

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const tableRoutes = require('./routes/tables');
const userRoutes = require('./routes/users');

const performanceMonitor = require('./middleware/performance');

const app = express();

// Performance Monitoring
app.use(performanceMonitor);

// Middleware
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : 'http://localhost:3000';

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
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = db.connections[0].readyState === 1;
        console.log('✅ MongoDB Connected');
        // Run seed asynchronously
        seedData().catch(err => console.error('Seed error:', err));
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
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

// Server initialization for local development
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    connectDB().then(() => {
        app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    });
}

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
        await Category.insertMany([
            { name: 'Dimsum Kukus', slug: 'dimsum-kukus', icon: '🥟', order: 1 },
            { name: 'Dimsum Goreng', slug: 'dimsum-goreng', icon: '🍤', order: 2 },
            { name: 'Paket Mix', slug: 'paket-mix', icon: '🎁', order: 3 },
            { name: 'Minuman', slug: 'minuman', icon: '🍵', order: 4 },
            { name: 'Jus', slug: 'jus', icon: '🍹', order: 5 },
            { name: 'Coffee', slug: 'coffee', icon: '☕', order: 6 },
            { name: 'Cemilan', slug: 'cemilan', icon: '🍟', order: 7 },
        ]);
        console.log('📂 Default categories created');
    }
}
