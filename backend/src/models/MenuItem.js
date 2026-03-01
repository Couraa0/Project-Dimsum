const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: String, default: '' },
    isBestSeller: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    stock: { type: Number, default: 100 },
    totalOrdered: { type: Number, default: 0 },
    tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
