const { Worker } = require('bullmq');
const { redisClient } = require('../../config/redis');
const { deletePromotionService, getExpiredPromotionsService } = require('../../services/promotionService');
const { deleteProductService, updateProductService, getProductByIdService } = require('../../services/productService');
const { AppError } = require('../../utils/error');


// Create cleanup function
const deleteExpiredPromotions = async () => {
    try {
        const expiredPromotions = await getExpiredPromotionsService();
        if (expiredPromotions && expiredPromotions.length > 0) {
            for (const promotion of expiredPromotions) {
                // Delete the promotion
                const deletedPromotion = await deletePromotionService(promotion._id);
                if (!deletedPromotion) {
                    throw new AppError('Failed to delete promotion', 404);
                }
                // Update products associated with the promotion
                for (const product of promotion.products) {
                    const productData = await getProductByIdService(product.product);
                    if (!productData) {
                        continue; // Skip if product not found
                    }
                    // Remove promotion details from the products in promotion
                    if (productData.inPromotion) {
                        if (true) {
                            const updatedProduct = await updateProductService(productData._id, {
                                quantity: productData.quantity + product.quantity,
                                promoId: null,
                                promoTitle: null,
                                inPromotion: false,
                                promotion: 'none',
                            });
                            if (!updatedProduct) {
                                throw new AppError('Failed to update product', 404);
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error deleting expired promotions:', error);
        throw new AppError('Failed to delete expired promotions', 500);
    }
};

// Create a worker to process the delete promotion job
const worker = new Worker('deletePromo', async (job) => {
    try {
        console.log('Processing delete promotion job...');
        await deleteExpiredPromotions();
        console.log('Delete promotion job completed successfully.');
    } catch (error) {
        console.error('Error processing delete promotion job:', error);
        throw new AppError('Failed to process delete promotion job', 500);
    }
}, { connection: redisClient });

// Handle worker events
worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});
worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});
worker.on('error', (err) => {
    console.error('Worker encountered an error:', err);
});