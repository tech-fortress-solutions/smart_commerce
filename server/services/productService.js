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


// get product by id service
const getProductByIdService = async (id) => {
    try {
        if (!id) {
            throw new AppError("No id provided", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid id", 400);
        }

        // get product by id
        const product = await Product.findById(id).populate('category', 'name _id');
        if (!product) {
            throw new AppError("No Product Found", 404);
        }
        return product;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error fetching product by ID:', error);
        throw new AppError('Failed to fetch product', 500);
    }
};


// get pruducts by category service
const getProductsByCategoryService = async (categoryId) => {
    try {
        if (!categoryId) {
            throw new AppError("No category ID provided", 400);
        }

        // validate category
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            throw new AppError("Invalid id", 400);
        }

        // get products by categoryid
        const products = await Product.find({ category: categoryId }).populate('category', 'name _id');
        if (!products || products.length === 0) {
            throw new AppError("No Products Found for this category", 404);
        }
        return products;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error fetching products by category ID:', error);
        throw new AppError('Failed to fetch products', 500);
    }
};


// get all products service
const getAllProductsService = async () => {
    try {
        // get all products
        const products = await Product.find({}).populate('category', 'name _id');
        if (!products || products.length === 0) {
            throw new AppError("No Products Found", 404);
        }
        return products;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error fetching all products:', error);
        throw new AppError('Failed to fetch products', 500);
    }
};


// update product by id service
const updateProductService = async (id, productData) => {
    try {
        if (!id) {
            throw new AppError("No id provided", 400);
        }

        // validate product id and fetch product
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid id", 400);
        }
        const product = await Product.findById(id);
        if (!product) {
            throw new AppError("No Product Found", 404);
        }

        // update product data
        const allowedFields = ['name', 'description', 'price', 'category', 'images', 'thumbnail', 'quantity'];
        Object.keys(productData).forEach(key => {
            if (!allowedFields.includes(key)) {
                // remove any fields not allowed to be updated
                delete productData[key];
            }
        });

        // return updated product
        const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true });
        if (!updatedProduct) {
            throw new AppError('Failed to update product', 500);
        }
        return updatedProduct;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error updating product by ID:', error);
        throw new AppError('Failed to update product', 500);
    }
};


// delete product service
const deleteProductService = async (id) => {
    try {
        if (!id) {
            throw new AppError("No id provided", 400);
        }
        // validate product id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid id", 400);
        }
        // delete product by id
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            throw new AppError("No Product Found with such ID", 404);
        }
        return deletedProduct;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error deleting product by ID:', error);
        throw new AppError('Failed to delete product', 500);
    }
};


// export functions
module.exports = {
    createProductService, getProductByIdService, getProductsByCategoryService, getAllProductsService,
    updateProductService, deleteProductService
}