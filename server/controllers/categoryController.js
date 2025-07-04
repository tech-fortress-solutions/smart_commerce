const { AppError } = require('../utils/error');
const { createCategoryService, getCategoryByIdService, getAllCategoriesService, updateCategoryService,
    deleteCategoryService
 } = require('../services/categoryService');
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
        categoryData.name = categoryData.name.trim().toLowerCase(); // Normalize category name

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


// get all categories controller
const getAllCategoriesController = async (req, res, next) => {
    try {
        // Get all categories using the service
        const categories = await getAllCategoriesService();
        if (!categories || categories.length === 0) {
            return next(new AppError('No categories found', 404));
        }

        // Return response with the list of categories
        res.status(200).json({
            status: 'success',
            message: 'Categories fetched successfully',
            data: categories.map(category => category.toObject())
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error fetching categories:', error);
        return next(new AppError('Failed to fetch categories', 500)); // Handle other errors gracefully
    }
};


// Update category controller
const updateCategoryController = async (req, res, next) => {
    try {
        const user = req.user // Get the authenticated user from the request
        if (!user) {
            return next(new AppError('User not authenticated', 401));
        }

        const categoryId = req.params.id; // Get category ID from request parameters
        if (!categoryId) {
            return next(new AppError('Category ID is required', 400));
        }

        // get updated category data from request body
        const updatedCategoryData = req.body
        
        const data = {};
        // check if category name is provided
        if (updatedCategoryData.name) {
            data.name = updatedCategoryData.name;
        }
        // check if category image is provided
        if (req.file) {
            // delete old image if exists
            const oldCategory = await getCategoryByIdService(categoryId);
            if (oldCategory && oldCategory.image) {
                const oldImage = await deleteImageService(oldCategory.image);
                if (!oldImage || !oldImage.deleted) {
                    return next(new AppError('Failed to delete old category image', 500));
                }
            }
            // upload new image and get url
            const imageUrl = await uploadImageService(req.file);
            if (!imageUrl) {
                return next(new AppError('Failed to upload category image', 500));
            }
            data.image = imageUrl; // Add new image URL to data
        }
        // update category using the service
        const updatedCategory = await updateCategoryService(categoryId, data);
        if (!updatedCategory) {
            return next(new AppError('Failed to update category', 500));
        }

        // Return response with the updated category
        res.status(200).json({
            status: 'success',
            message: 'Category updated successfully',
            data: [updatedCategory.toObject()]
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error updating category:', error);
        return next(new AppError('Failed to update category', 500)); // Handle other errors gracefully
    }
};


// delete category controller
const deleteCategoryController = async (req, res, next) => {
    try {
        const id = req.params.id; // Get category ID from request parameters
        if (!id) {
            return next(new AppError('Category ID is required', 400));
        }

        const category = await getCategoryByIdService(id);
        if (!category) {
            return next(new AppError('No category found with the provided ID', 404));
        }

        // delete category image if exists
        if (category.image) {
            const deletedImage = await deleteImageService(category.image);
            if (!deletedImage || !deletedImage.deleted) {
                return next(new AppError('Failed to delete category image', 500));
            }
        }
        // delete category using the service
        const deletedCategory = await deleteCategoryService(id);
        if (!deletedCategory || !deletedCategory.deleted) {
            return next(new AppError('Failed to delete category', 500));
        }
        // Return response indicating successful deletion
        res.status(200).json({
            status: 'success',
            message: 'Category deleted successfully',
            data: { deleted: true }
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error deleting category:', error);
        return next(new AppError('Failed to delete category', 500)); // Handle other errors gracefully
    }
};


// get category by id
const getCategoryController = async (req, res, next) => {
    try {
        const id = req.params.id; // Get category ID from request parameters
        if (!id) {
            return next(new AppError('Category ID is required', 400));
        }

        // Get category by ID using the service
        const category = await getCategoryByIdService(id);
        if (!category) {
            return next(new AppError('No category found with the provided ID', 404));
        }

        // Return response with the category data
        res.status(200).json({
            status: 'success',
            message: 'Category fetched successfully',
            data: [category.toObject()]
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error fetching category:', error);
        return next(new AppError('Failed to fetch category', 500)); // Handle other errors gracefully
    }
};


// Export the controller
module.exports = {
    createCategoryController, getAllCategoriesController, updateCategoryController, deleteCategoryController,
    getCategoryController
};