const mongoose = require('mongoose');


// create product object model
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    quantity: { type: Number, required: true, min: 0 },
    thumbnail: { type: String, required: true }, // Cover image URL
    images: { type: [String], default: [] }, // Array of image URLs
    totalRating: { type: Number, default: 0 },
    numReviews : { type: Number, default: 0 },
    currency: { type: String, default: 'NGN' }, // Default currency is NGN
    promotion: { type: String, enum: ['new stock', 'discount promo', 'buyOneGetOne', 'none'], default: 'none' },
    promoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', required: false },
    promoTitle: { type: String },
    inPromotion: { type: Boolean, default: false }, // Whether the product is currently in a promotion
}, { timestamps: true });

// Add indexes for better performance
productSchema.index({ name: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ promotion: 1 });
productSchema.index({ promoId: 1 });

// check if product is in stock
productSchema.virtual('inStock').get(function () {
    return this.quantity > 0;
});

// Get the name of product category
productSchema.virtual('categoryName').get(function () {
    return this.category && typeof this.category === 'object' ? this.category.name : null;
});

// Calculate the average rating of the product
productSchema.virtual('rating').get(function () {
    if (this.numReviews > 0) {
        return (this.totalRating / this.numReviews).toFixed(1); // Return average rating
    }
    return 0; // Return 0 if no reviews
});

// enable toJSON and toObject methods to include virtuals
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true  });

// Create a model from the schema
const Product = mongoose.model('Product', productSchema);

// Export the model
module.exports = Product;