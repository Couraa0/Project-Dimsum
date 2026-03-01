const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    name: { type: String, default: '' },
    capacity: { type: Number, default: 4 },
    qrCode: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
    currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
