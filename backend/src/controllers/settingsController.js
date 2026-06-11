const prisma = require('../utils/prisma');
const path = require('path');
const supabase = require('../utils/supabase');

exports.getSettings = async (req, res) => {
    try {
        let settings = await prisma.storeSettings.findUnique({
            where: { id: 'default' }
        });
        
        // Fail-safe jika database belum ter-seed
        if (!settings) {
            settings = {
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
                tiktokUrl: '#',
                heroTitle: 'Dimsum Lezat, Siap Dinikmati!',
                heroDesc: 'Cita rasa dimsum autentik khas China Town, kini hadir di Karawang. Dine-in nyaman, take away praktis, atau delivery langsung ke pintu Anda.',
                heroImage: '/images/hero.png',
                stat1Val: '500+',
                stat1Label: 'Pelanggan Puas',
                stat2Val: '4.9★',
                stat2Label: 'Rating Google',
                stat3Val: '20+',
                stat3Label: 'Varian Menu',
                feat1Title: 'Bahan Segar Harian',
                feat1Desc: 'Dipilih setiap pagi, disajikan fresh untuk rasa terbaik',
                feat2Title: 'Koki Berpengalaman',
                feat2Desc: 'Resep tradisional autentik dari koki berpengalaman 15+ tahun',
                feat3Title: 'Delivery Cepat',
                feat3Desc: 'Pengiriman dalam 30-60 menit ke seluruh area Karawang',
                feat4Title: 'Bayar Mudah',
                feat4Desc: 'Transfer, QRIS, atau bayar di tempat — semua bisa!',
                step1Title: 'Pilih Menu',
                step1Desc: 'Browse menu lengkap kami, pilih favorit Anda sesuka hati',
                step2Title: 'Tambah Keranjang',
                step2Desc: 'Klik tombol + lalu sesuaikan jumlah dan catatan pesanan',
                step3Title: 'Konfirmasi & Bayar',
                step3Desc: 'Pilih metode bayar, pesanan langsung kami proses secepatnya',
                ctaTitle: 'Siap Menikmati Dimsum Terbaik?',
                ctaDesc: 'Kunjungi kami atau pesan delivery sekarang. Kami melayani dengan sepenuh hati!'
            };
        }
        
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { 
            storeName, address, operatingHours, contact, instagram, mapUrl, facebookUrl, instagramUrl, tiktokUrl,
            heroTitle, heroDesc, stat1Val, stat1Label, stat2Val, stat2Label, stat3Val, stat3Label,
            feat1Title, feat1Desc, feat2Title, feat2Desc, feat3Title, feat3Desc, feat4Title, feat4Desc,
            step1Title, step1Desc, step2Title, step2Desc, step3Title, step3Desc, ctaTitle, ctaDesc
        } = req.body;
        
        // Siapkan objek data untuk diupdate
        const updateData = {};
        const updateFields = [
            'storeName', 'address', 'operatingHours', 'contact', 'instagram', 'mapUrl', 'facebookUrl', 'instagramUrl', 'tiktokUrl',
            'heroTitle', 'heroDesc', 'stat1Val', 'stat1Label', 'stat2Val', 'stat2Label', 'stat3Val', 'stat3Label',
            'feat1Title', 'feat1Desc', 'feat2Title', 'feat2Desc', 'feat3Title', 'feat3Desc', 'feat4Title', 'feat4Desc',
            'step1Title', 'step1Desc', 'step2Title', 'step2Desc', 'step3Title', 'step3Desc', 'ctaTitle', 'ctaDesc'
        ];
        
        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Proses unggah logo baru ke Supabase Storage jika ada
        const logoFile = req.files?.logo?.[0];
        const heroFile = req.files?.heroImage?.[0];

        if (logoFile) {
            const filename = `logo-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(logoFile.originalname)}`;
            const { error: uploadError } = await supabase.storage
                .from('dimsum-images')
                .upload(filename, logoFile.buffer, {
                    contentType: logoFile.mimetype,
                    upsert: false
                });

            if (uploadError) {
                console.error('Gagal mengunggah logo ke Supabase:', uploadError.message);
                return res.status(500).json({ success: false, message: 'Gagal mengunggah logo: ' + uploadError.message });
            }

            const { data: publicUrlData } = supabase.storage
                .from('dimsum-images')
                .getPublicUrl(filename);
                
            updateData.logo = publicUrlData.publicUrl;
        }

        // Proses unggah heroImage baru ke Supabase Storage jika ada
        if (heroFile) {
            const filename = `hero-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(heroFile.originalname)}`;
            const { error: uploadError } = await supabase.storage
                .from('dimsum-images')
                .upload(filename, heroFile.buffer, {
                    contentType: heroFile.mimetype,
                    upsert: false
                });

            if (uploadError) {
                console.error('Gagal mengunggah heroImage ke Supabase:', uploadError.message);
                return res.status(500).json({ success: false, message: 'Gagal mengunggah gambar hero: ' + uploadError.message });
            }

            const { data: publicUrlData } = supabase.storage
                .from('dimsum-images')
                .getPublicUrl(filename);
                
            updateData.heroImage = publicUrlData.publicUrl;
        }

        const settings = await prisma.storeSettings.upsert({
            where: { id: 'default' },
            update: updateData,
            create: {
                id: 'default',
                storeName: storeName || 'Dimsum Ratu',
                logo: updateData.logo || '/logo.png',
                address: address || 'Jl. Raya Karawang No. 88, Karawang Barat, Jawa Barat',
                operatingHours: operatingHours || 'Setiap Hari: 10.00 – 21.00 WIB',
                contact: contact || '0878-7131-0560',
                instagram: instagram || '@dimsumratu',
                mapUrl: mapUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63447.39099520374!2d107.27120727889587!3d-6.334154474228071!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6977baaaffcbfd%3A0x6d3a08c27370d633!2sDimsum%20Ratu%20Oishii!5e0!3m2!1sid!2sid!4v1772400307613!5m2!1sid!2sid',
                facebookUrl: facebookUrl || '#',
                instagramUrl: instagramUrl || '#',
                tiktokUrl: tiktokUrl || '#',
                heroTitle: heroTitle || 'Dimsum Lezat, Siap Dinikmati!',
                heroDesc: heroDesc || 'Cita rasa dimsum autentik khas China Town, kini hadir di Karawang. Dine-in nyaman, take away praktis, atau delivery langsung ke pintu Anda.',
                heroImage: updateData.heroImage || '/images/hero.png',
                stat1Val: stat1Val || '500+',
                stat1Label: stat1Label || 'Pelanggan Puas',
                stat2Val: stat2Val || '4.9★',
                stat2Label: stat2Label || 'Rating Google',
                stat3Val: stat3Val || '20+',
                stat3Label: stat3Label || 'Varian Menu',
                feat1Title: feat1Title || 'Bahan Segar Harian',
                feat1Desc: feat1Desc || 'Dipilih setiap pagi, disajikan fresh untuk rasa terbaik',
                feat2Title: feat2Title || 'Koki Berpengalaman',
                feat2Desc: feat2Desc || 'Resep tradisional autentik dari koki berpengalaman 15+ tahun',
                feat3Title: feat3Title || 'Delivery Cepat',
                feat3Desc: feat3Desc || 'Pengiriman dalam 30-60 menit ke seluruh area Karawang',
                feat4Title: feat4Title || 'Bayar Mudah',
                feat4Desc: feat4Desc || 'Transfer, QRIS, atau bayar di tempat — semua bisa!',
                step1Title: step1Title || 'Pilih Menu',
                step1Desc: step1Desc || 'Browse menu lengkap kami, pilih favorit Anda sesuka hati',
                step2Title: step2Title || 'Tambah Keranjang',
                step2Desc: step2Desc || 'Klik tombol + lalu sesuaikan jumlah dan catatan pesanan',
                step3Title: step3Title || 'Konfirmasi & Bayar',
                step3Desc: step3Desc || 'Pilih metode bayar, pesanan langsung kami proses secepatnya',
                ctaTitle: ctaTitle || 'Siap Menikmati Dimsum Terbaik?',
                ctaDesc: ctaDesc || 'Kunjungi kami atau pesan delivery sekarang. Kami melayani dengan sepenuh hati!'
            }
        });

        res.json({ success: true, message: 'Pengaturan toko berhasil diperbarui', data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
