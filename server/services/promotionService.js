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


// Export promotion service functions
module.exports = {
    createPromotionService,
}