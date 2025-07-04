const mongoose = require('mongoose');
const { AppError } = require('../utils/error');
const Product = require('../models/product');


// create product controller
const createProductService = async (productData) => {
    try {
        // check if product already exists
        productData.name = productData.name.trim().toLowerCase();
        const existingProduct = await Product.findOne({ name: productData.name });
        if (existingProduct) {
            throw new AppError('Product already exists', 400);
        }

        // validate category id
        if (!productData.category || !mongoose.Types.ObjectId.isValid(productData.category)) {
            throw new AppError('Invalid category ID', 400);
        }

        // create new product
        const newProduct = await Product.create(productData);
        if (!newProduct) {
            throw new AppError('Failed to create product', 500);
        }

        // populate category details
        await newProduct.populate('category', 'name _id');
        return newProduct;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error creating product:', error);
        throw new AppError('Failed to create product', 500);
    }
};


// export functions
module.exports = {
    createProductService,
}