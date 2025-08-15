// Order object model
const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        description: { type: String, required: true }, // Product description
        thumbnail: { type: String, required: true }, // Product thumbnail URL
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }, // Price at the time of order
    }],
    totalAmount: { type: Number, required: true, min: 0 }, // Total amount for the order
    reference: { type: String, required: true, unique: true }, // Unique reference for the order
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' }, // Order status, default is 'pending'
    paidAt: { type: Date, required: false }, // Date when the order was paid
    currency: { type: String, default: 'NGN' }, // Default currency is NGN
    receiptPdf: { type: String, required: false }, // URL to the receipt PDF
    receiptImage: { type: String, required: false }, // URL to the receipt image
}, { timestamps: true });

// Create a model from the schema
const Order = mongoose.model('Order', orderSchema, 'orders');
// Export the model
module.exports = Order;