// category model module
const mongoose = require('mongoose');


const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Create a model from the schema
const Category = mongoose.model('Category', categorySchema);

// Export the model
module.exports = Category;