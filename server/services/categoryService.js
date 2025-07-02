const Category = require('../models/category');
const { AppError } = require('../utils/error');


// create category service
const createCategoryService = async (categoryData) => {
    try {
        // check if category already exists
        const existingCategory = await Category.findOne({ name: categoryData.name });
        if (existingCategory) {
            throw new AppError('Category already exists', 400);
        }

        // create new category
        const newCategory = await Category.create(categoryData);
        return newCategory;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error creating category:', error);
        throw new AppError('Failed to create category', 500);
    }
};


// export all services
module.exports = {
    createCategoryService,
};