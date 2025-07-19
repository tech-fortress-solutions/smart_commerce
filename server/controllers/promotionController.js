const { createPromotionService } = require('../services/promotionService');
const { AppError } = require('../utils/error');
const { uploadImageService, deleteImageService } = require('../services/uploadService');
const { sanitize, htmlToImage } = require('../utils/helper');


// Create a new promotion
const createPromotionController = async (req, res, next) => {
    try {
        const { title, description, type, startDate, endDate, products, discountPercentage, template } = req.body;
        if (!title || !type || !startDate || !endDate || !products || !template) {
            return next(new AppError('Required fields are missing', 400));
         }
         if (typeof template !== 'string') {
            return next(new AppError('Template must be a string', 400));
         }

         // validate type
         const validTypes = ['new stock', 'discount promo', 'buyOneGetOne', 'none'];
         if (!validTypes.includes(type)) {
            return next(new AppError(`Invalid promotion type. Valid types are: ${validTypes.join(', ')}`, 400));
         };

         // create promotion data object
         const promotionData = {
            title: sanitize(title),
            description: description ? sanitize(description) : '',
            type,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            discountPercentage: discountPercentage ? parseInt(discountPercentage, 10) : undefined,
            products: products.map(product => ({
               product: sanitize(product.product),
               quantity: parseInt(product.quantity, 10),
               mainPrice: parseInt(product.mainPrice),
               promoPrice: parseInt(product.promoPrice)
            }))
         };

         // convert HTML template to image
         const image = await htmlToImage(promotionData.title, template);
         if (!image) {
            return next(new AppError('Failed to convert HTML to image', 500));
         }
         // upload image to cloud storage
         const uploadedImage = await uploadImageService(image);
         if (!uploadedImage) {
            return next(new AppError('Failed to upload promotion image', 500));
         }
         // add cover image URL to promotion data
         promotionData.coverImage = uploadedImage;

         // create promotion using service
         const newPromotion = await createPromotionService(promotionData);
         if (!newPromotion) {
            return next(new AppError('Failed to create promotion', 500));
         }

         // return response with new promotion
         return res.status(201).json({
            status: 'success',
            message: 'Promotion created successfully',
            data: {
                promotion: newPromotion
            }
         });
    } catch (error) {
        console.error('Error creating promotion:', error);
        return next(new AppError('Internal server error', 500));
    }
};


// Export the controller
module.exports = {
    createPromotionController,
};