const Review = require('../models/review');
const { AppError } = require('../utils/error');
const mongoose = require('mongoose');


// Create a new review
const createReviewService = async (reviewData) => {
    try {
        if (!reviewData || Object.keys(reviewData).length === 0) {
            throw new AppError('No review data provided', 400);
        }

        // Create a new review instance
        const newReview = await Review.create(reviewData);
        if (!newReview) {
            throw new AppError('Failed to create review', 500);
        }

        return newReview;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error creating review:', error);
        throw new AppError('Failed to create review', 500);
    }
};


// Get all reviews for a product
const getReviewsByProductService = async (productId) => {
    try {
        if (!productId) {
            throw new AppError('No product ID provided', 400);
        }
        // Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new AppError('Invalid product ID', 400);
        }

        // Get reviews by product ID
        const reviews = await Review.find({ product: productId}).populate('user', 'firstname lastname');
        if (!reviews) {
            throw new AppError("No reviews found", 404);
        }

        return reviews;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.error("Error getting poduct's reviews: ", error);
        throw new AppError("An error occured while getting product's review, try again later.", 500)
    }
};


// Check if user has reviewed product service
const validateReviewService = async (userId, productId) => {
    try {
        if (!userId || !productId) {
            throw new AppError('User ID and Product ID are required', 400);
        }

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            throw new AppError('Invalid user or product ID', 400);
        }

        // Check if review exists
        const review = await Review.findOne({ user: userId, product: productId });
        return !!review; // Return true if review exists, false otherwise
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error validating review:', error);
        return false; // Return false in case of any error
    }
};


// Export functions
module.exports = {
    createReviewService, getReviewsByProductService, validateReviewService,
}