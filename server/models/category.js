// category model module
const mongoose = require('mongoose');


const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// create products count virtual field
categorySchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'category',
    count: true // This will return the count of products in this category
});

// Ensure virtual fields are virtualized when converting to JSON and Object
categorySchema.set('toObject', { virtuals: true });
categorySchema.set('toJSON', { virtuals: true });

// Create a model from the schema
const Category = mongoose.model('Category', categorySchema);

// Export the model
module.exports = Category;