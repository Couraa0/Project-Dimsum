require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Terhubung ke database');

        // Hapus akun lama jika ada
        await User.deleteOne({ email: 'admin@dimsumratu.com' });
        
        // Buat akun baru
        const admin = new User({
            name: 'Dimsum Ratu',
            email: 'admin@dimsumratu.com',
            password: 'admin123',
            role: 'admin',
            isActive: true
        });

        await admin.save();
        console.log('✅ Admin berhasil ditambahkan ke koleksi Users!');
        console.log('Login: admin@dimsumratu.com');
        console.log('Password: admin123');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Gagal menambahkan admin:', err.message);
        process.exit(1);
    }
};

seedAdmin();
