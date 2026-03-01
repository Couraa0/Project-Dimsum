const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
    notes: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },
    type: { type: String, enum: ['dine-in', 'takeaway', 'delivery'], required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
        default: 'pending'
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['transfer', 'qris', 'cash'], default: 'cash' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    tableNumber: { type: String, default: null },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null },
    customer: {
        name: { type: String, default: 'Guest' },
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
        notes: { type: String, default: '' },
    },
    estimatedTime: { type: Number, default: 15 },
}, { timestamps: true });

orderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        const date = new Date();
        this.orderNumber = `DR${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('Order', orderSchema);
