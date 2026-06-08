const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const regions = [
    'ap-southeast-1', // Singapore
    'ap-southeast-2', // Sydney
    'ap-northeast-1', // Tokyo
    'ap-northeast-2', // Seoul
    'ap-south-1',     // Mumbai
    'us-east-1',      // N. Virginia
    'us-east-2',      // Ohio
    'us-west-1',      // N. California
    'us-west-2',      // Oregon
    'eu-central-1',   // Frankfurt
    'eu-west-1',      // Ireland
    'eu-west-2',      // London
    'eu-west-3',      // Paris
    'sa-east-1',      // Sao Paulo
    'ca-central-1'    // Canada
];

async function testRegions() {
    const password = 'DimsumRatu2026';
    const projectRef = 'yjakhlqkrjjsfqovpnkf';
    
    console.log('🔍 Memulai pemindaian regional pooler Supabase...');
    for (const region of regions) {
        const host = `aws-0-${region}.pooler.supabase.com`;
        const url = `postgresql://postgres.${projectRef}:${password}@${host}:5432/postgres`;
        
        console.log(`Mencoba region: ${region} (${host})...`);
        const prisma = new PrismaClient({
            datasources: {
                db: { url }
            }
        });
        
        try {
            await prisma.$connect();
            console.log(`\n🎉 SUKSES! Proyek Anda berada di region: ${region}`);
            console.log(`Connection URL: ${url}\n`);
            await prisma.$disconnect();
            process.exit(0);
        } catch (err) {
            if (err.message.includes('tenant/user') && err.message.includes('not found')) {
                console.log(`   ❌ Region ${region}: Tenant tidak ditemukan di pooler ini.`);
            } else if (err.message.includes('Can\'t reach database server')) {
                console.log(`   ❌ Region ${region}: Server tidak dapat dijangkau (offline/timeout).`);
            } else {
                console.log(`   ❓ Region ${region} error lain:`, err.message);
            }
        }
    }
    console.log('\n❌ Pemindaian selesai. Tidak ada region yang berhasil terhubung.');
    console.log('Pastikan proyek Supabase Anda tidak di-pause dan password database Anda benar.');
    process.exit(1);
}

testRegions();
