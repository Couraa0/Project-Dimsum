require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const MenuItem = require('./src/models/MenuItem');
    const Category = require('./src/models/Category');

    const sample = await MenuItem.findOne();
    if (sample) {
        console.log(`Sample MenuItem: "${sample.name}"`);
        console.log(`- Category type: ${typeof sample.category}`);
        console.log(`- Category value:`, sample.category);
        console.log(`- Is category an array? ${Array.isArray(sample.category)}`);
    } else {
        console.log('No menu items found');
    }
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
