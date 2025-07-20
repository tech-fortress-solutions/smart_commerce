const mongoose = require('mongoose');
const Promotion = require('../models/promotion');
const { AppError } = require('../utils/error');


// Create Promotion Controller
const createPromotionService = async (promotionData) => {
    try {
        if (!promotionData || Object.keys(promotionData).length === 0) {
            throw new AppError('No promotion data provided', 400);
        }

        // Create a new promotion instance
        const newPromotion = await Promotion.create(promotionData);
        if (!newPromotion) {
            throw new AppError('Failed to create promotion', 500);
        }
        return newPromotion.toObject();
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error creating promotion:', error);
        throw new AppError('Failed to create promotion', 500);
    }
};


// Get latest active promotion service
const getActivePromotionService = async () => {
    try {
        // Get the latest active promotion
        const activePromotion = await Promotion.findOne({ active: true }).sort({ createdAt: -1 })
            .populate('products.product', 'thumbnail name currency description category images totalRating numReviews');
        
        if (!activePromotion) {
            throw new AppError('No active promotion found', 404);
        }

        return activePromotion;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error getting active promotion:', error);
        throw new AppError('Failed to get active promotion', 500);
    }
};

// Get promotion by ID service
const getPromotionByIdService = async (promotionId) => {
    try {
        if (!promotionId) {
            throw new AppError('No promotion ID provided', 400);
        }
        // Validate promotion ID
        if (!mongoose.Types.ObjectId.isValid(promotionId)) {
            throw new AppError('Invalid promotion ID', 400);
        }
        // Get promotion by ID
        const promotion = await Promotion.findById(promotionId)
            .populate('products.product', 'thumbnail name currency description category images totalRating numReviews');
        if (!promotion) {
            throw new AppError('Promotion not found', 404);
        }
        return promotion;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error getting promotion by ID:', error);
        throw new AppError('Failed to get promotion by ID', 500);
    }
};


// Update promotion service
const updatePromotionService = async (promotionId, updateData) => {
    try {
        if (!promotionId || !updateData || Object.keys(updateData).length === 0) {
            throw new AppError('Promotion ID and update data are required', 400);
        }
        // Validate promotion ID
        if (!mongoose.Types.ObjectId.isValid(promotionId)) {
            throw new AppError('Invalid promotion ID', 400);
        }
        // Update the promotion
        const updatedPromotion = await Promotion.findByIdAndUpdate(promotionId, updateData, { new: true })
            .populate('products.product', 'thumbnail name currency description category images totalRating numReviews');
        if (!updatedPromotion) {
            throw new AppError('Failed to update promotion', 404);
        }
        return updatedPromotion;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw custom AppError
        }
        console.error('Error updating promotion:', error);
        throw new AppError('Failed to update promotion', 500);
    }
};


// Export promotion service functions
module.exports = {
    createPromotionService, getActivePromotionService, getPromotionByIdService, updatePromotionService,
}