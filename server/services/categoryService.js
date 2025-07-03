const mongoose = require('mongoose');
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


// get category by id
const getCategoryByIdService = async (id) => {
    try {
        if (!id) {
            throw new AppError("No id provided", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid id", 400);
        }

        // get category by id
        const category = await Category.findById(id);
        if (!category) {
            throw new AppError("No Category Found", 404);
        }

        return category;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error fetching category by ID:', error);
        throw new AppError('Failed to fetch category', 500);
    }
};


// get all categories service
const getAllCategoriesService = async () => {
    try {
        // get all categories
        const categories = await Category.find({});
        if (!categories || categories.length === 0) {
            throw new AppError("No Categories Found", 404);
        }
        return categories;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error fetching all categories:', error);
        throw new AppError('Failed to fetch categories', 500);
    }
};


// update category service
const updateCategoryService = async (id, categoryData) => {
    try {
        if (!id) {
            throw new AppError("No id provided", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid id", 400);
        }

        // update category by id
        const updatedCategory = await Category.findByIdAndUpdate(id, categoryData, { new: true });
        if (!updatedCategory) {
            throw new AppError("No Category Found with such ID", 404);
        }

        return updatedCategory;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error updating category:', error);
        throw new AppError('Failed to update category', 500);
    }
};


// delet category service
const deleteCategoryService = async (id) => {
    try {
        if (!id) {
            throw new AppError("No id provided", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid id", 400);
        }

        // delete category by id
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            throw new AppError("No Category Found with such ID", 404);
        }

        return { deleted: true };
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error deleting category:', error);
        throw new AppError('Failed to delete category', 500);
    }
};


// export all services
module.exports = {
    createCategoryService, getCategoryByIdService, getAllCategoriesService, updateCategoryService,
    deleteCategoryService
};