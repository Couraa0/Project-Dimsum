require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const prisma = require('../src/utils/prisma');
const supabase = require('../src/utils/supabase');

async function migrateImages() {
    console.log('Memulai migrasi gambar ke Supabase Storage...');

    try {
        const items = await prisma.menuItem.findMany();
        console.log(`Ditemukan ${items.length} menu items.`);

        let successCount = 0;
        let failCount = 0;
        let skipCount = 0;

        for (const item of items) {
            if (item.image && item.image.startsWith('/uploads/')) {
                console.log(`Memproses menu: ${item.name} (${item.image})`);
                
                const localImagePath = path.join(__dirname, '../', item.image);
                
                if (fs.existsSync(localImagePath)) {
                    try {
                        const fileBuffer = fs.readFileSync(localImagePath);
                        const filename = item.image.split('/').pop();
                        const contentType = mime.lookup(localImagePath) || 'application/octet-stream';

                        console.log(`Mengunggah ${filename}...`);
                        const { data, error } = await supabase.storage
                            .from('dimsum-images')
                            .upload(filename, fileBuffer, {
                                contentType,
                                upsert: true // Overwrite if exists
                            });

                        if (error) {
                            console.error(`Gagal mengunggah ${filename}:`, error.message);
                            failCount++;
                            continue;
                        }

                        const { data: publicUrlData } = supabase.storage
                            .from('dimsum-images')
                            .getPublicUrl(filename);
                        
                        const newUrl = publicUrlData.publicUrl;

                        await prisma.menuItem.update({
                            where: { id: item.id },
                            data: { image: newUrl }
                        });

                        console.log(`Berhasil: ${newUrl}`);
                        successCount++;
                    } catch (err) {
                        console.error(`Gagal memproses ${item.name}:`, err.message);
                        failCount++;
                    }
                } else {
                    console.log(`File lokal tidak ditemukan: ${localImagePath}`);
                    failCount++;
                }
            } else {
                skipCount++;
            }
        }

        console.log('\n--- Hasil Migrasi ---');
        console.log(`Berhasil : ${successCount}`);
        console.log(`Gagal    : ${failCount}`);
        console.log(`Dilewati : ${skipCount} (tidak perlu migrasi)`);

    } catch (err) {
        console.error('Terjadi kesalahan fatal:', err);
    } finally {
        await prisma.$disconnect();
    }
}

migrateImages();
