require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB');
    
    const db = mongoose.connection.db;
    const Category = require('./src/models/Category');

    console.log('🔄 Cleaning up types first (Raw MongoDB)...');
    
    // Step 0: Aggressively migrate ALL items to array if not already
    const items = await db.collection('menuitems').find().toArray();
    let count = 0;
    for (const item of items) {
        if (item.category && !Array.isArray(item.category)) {
            await db.collection('menuitems').updateOne(
                { _id: item._id },
                { $set: { category: [item.category] } }
            );
            count++;
        }
    }
    console.log(`- Type cleanup (Raw): converted ${count} items to array.`);

    // Step 1: Migration for Paket Hemat
    const paketHemat = await Category.findOne({ slug: 'paket-hemat' });
    const paketMix = await Category.findOne({ slug: 'paket-mix' });
    if (paketHemat) {
        if (paketMix) {
            await db.collection('menuitems').updateMany({ category: paketHemat._id }, { $addToSet: { category: paketMix._id } });
            await db.collection('menuitems').updateMany({ category: paketHemat._id }, { $pull: { category: paketHemat._id } });
        }
        await Category.deleteOne({ _id: paketHemat._id });
        console.log('- Removed Paket Hemat');
    }

    // Step 2: Split Jus & Coffee, add Cemilan
    const oldJusCoffee = await Category.findOne({ slug: 'jus-coffee' });
    
    let jus = await Category.findOne({ slug: 'jus' });
    if (!jus) jus = await Category.create({ name: 'Jus', slug: 'jus', icon: '🍹', order: 5 });
    
    let coffee = await Category.findOne({ slug: 'coffee' });
    if (!coffee) coffee = await Category.create({ name: 'Coffee', slug: 'coffee', icon: '☕', order: 6 });
    
    let cemilan = await Category.findOne({ slug: 'cemilan' });
    if (!cemilan) cemilan = await Category.create({ name: 'Cemilan', slug: 'cemilan', icon: '🍟', order: 7 });

    if (oldJusCoffee) {
        await db.collection('menuitems').updateMany({ category: oldJusCoffee._id }, { $addToSet: { category: { $each: [jus._id, coffee._id] } } });
        await db.collection('menuitems').updateMany({ category: oldJusCoffee._id }, { $pull: { category: oldJusCoffee._id } });
        await Category.deleteOne({ _id: oldJusCoffee._id });
        console.log('- Split Jus & Coffee');
    }

    console.log('\n✅ COMPLETED. Categories now:');
    const catsFinal = await Category.find().sort({ order: 1 });
    catsFinal.forEach(c => console.log(`- ${c.name} (${c.slug})` || c.name));

    process.exit(0);
}

run().catch(err => {
    console.error('CRITICAL ERROR:', err);
    process.exit(1);
});
