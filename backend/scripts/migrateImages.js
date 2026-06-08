const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const MenuItem = require('../src/models/MenuItem');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI tidak ditemukan di file .env');
    process.exit(1);
}

async function migrate() {
    try {
        console.log('🔄 Menghubungkan ke MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected.');

        // Pastikan folder uploads ada
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log('📂 Membuat folder uploads baru...');
        }

        // Cari menu yang field image-nya berisi data base64
        const items = await MenuItem.find({ image: { $regex: /^data:image/ } });
        console.log(`📋 Menemukan ${items.length} menu dengan format gambar base64.`);

        let successCount = 0;
        for (const item of items) {
            try {
                const matches = item.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (!matches || matches.length !== 3) {
                    console.warn(`⚠️ Format base64 tidak valid untuk menu: "${item.name}"`);
                    continue;
                }

                const mimeType = matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, 'base64');

                // Tentukan ekstensi file
                let extension = 'png';
                if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
                    extension = 'jpg';
                } else if (mimeType.includes('webp')) {
                    extension = 'webp';
                } else if (mimeType.includes('gif')) {
                    extension = 'gif';
                }

                const filename = `menu-migrated-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
                const savePath = path.join(uploadsDir, filename);

                // Tulis file ke disk secara sinkron
                fs.writeFileSync(savePath, buffer);
                
                // Update path gambar di database
                item.image = `/uploads/${filename}`;
                await item.save();

                console.log(`   ✔️  "${item.name}" -> ${item.image}`);
                successCount++;
            } catch (err) {
                console.error(`   ❌ Gagal memigrasi menu "${item.name}":`, err.message);
            }
        }

        console.log(`\n🎉 Migrasi selesai! ${successCount} dari ${items.length} menu berhasil dimigrasi.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Terjadi kesalahan pada proses migrasi:', err);
        process.exit(1);
    }
}

migrate();
