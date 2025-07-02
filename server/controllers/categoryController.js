const { AppError } = require('../utils/error');
const { createCategoryService } = require('../services/categoryService');
const { uploadImageService, deleteImageService } = require('../services/uploadService');


// Controller to handle category creation
const createCategoryController = async (req, res, next) => {
    try {
        const user = req.user; // Get the authenticated user from the request
        if (!user) {
            return next(new AppError('User not authenticated', 401));
        }

        const categoryData = req.body; // Get category data from request body
        // validate category name
        if (!categoryData.name) {
            return next(new AppError('Category name is required', 400));
        }

        // Add author to category data
        categoryData.author = user._id;

        // upload image to bucket and get url
        if (!req.file) {
            return next(new AppError('Category image is required', 400));
        }
        const imageUrl = await uploadImageService(req.file);
        if (!imageUrl) {
            return next(new AppError('Failed to upload category image', 500));
        }

        // Add image URL to category data
        categoryData.image = imageUrl;

        // Create category using the service
        const newCategory = await createCategoryService(categoryData);
        if (!newCategory) {
            return next(new AppError('Failed to create category', 500));
        }

        // return response with the created category
        res.status(201).json({
            status: 'success',
            message: 'Category created successfully',
            data: [newCategory.toObject()]
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error creating category:', error);
        return next(new AppError('Failed to create category', 500)); // Handle other errors gracefully
    }
};


// Export the controller
module.exports = {
    createCategoryController,
};