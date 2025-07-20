const { createPromotionService, getActivePromotionService, getPromotionByIdService, updatePromotionService,
      deletePromotionService,
 } = require('../services/promotionService');
 const { updateProductService, getProductByIdService, deleteProductService } = require('../services/productService');
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

         // validate dates
         if (isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
            return next(new AppError('Invalid date format', 400));
         }
         if (new Date(startDate) >= new Date(endDate)) {
            return next(new AppError('Start date must be before end date', 400));
         }

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

         // update products in promotion
         for (const product of newPromotion.products) {
            const productData = await getProductByIdService(product.product);
            if (!productData) {
               return next(new AppError(`Product with ID ${product.product} not found`, 404));
            }
            // update product promotion details if product is not already in a promotion
            if (!productData.inPromotion) {
               if (productData.quantity < product.quantity) {
                  return next(new AppError(`Insufficient stock for product ${productData.name}, increase product stock quantity or reduce quantity for promotion`, 400));
               }
               const updatedProduct = await updateProductService(productData._id, {
                  quantity: productData.quantity - product.quantity,
                  inPromotion: true,
                  promotion: newPromotion.type,
                  promoId: newPromotion._id,
                  promoTitle: newPromotion.title,
                  deleteAt: (newPromotion.type !== 'new stock') ? newPromotion.endDate : null
               });
               if (!updatedProduct) {
                  return next(new AppError(`Failed to update product ${productData.name} for promotion`, 500));
               };
            }
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


// Get active promotion controller
const getActivePromotionController = async (req, res, next) => {
   try {
      // Get active promotion using service
      const activePromotion = await getActivePromotionService();
      if (!activePromotion) {
         return next(new AppError('No active promotion found', 404));
      }
      // Return response with active promotion
      return res.status(200).json({
         status: 'success',
         message: 'Active promotion retrieved successfully',
         data: {
            promotion: activePromotion.toObject()
         }
      });
   } catch (error) {
      console.error('Error getting active promotion:', error);
      return next(new AppError('Internal server error', 500));
   }
};


// Get Promotion by id controller
const getPromotionByIdController = async (req, res, next) => {
   try {
      const promoId = req.params.id;
      if (!promoId) {
         return next(new AppError('Promotion ID is required', 400));
      }
      // Get promotion by ID using service
      const promotion = await getPromotionByIdService(promoId);
      if (!promotion) {
         return next(new AppError('Promotion not found', 404));
      }
      // Return response with promotion details
      return res.status(200).json({
         status: 'success',
         message: 'Promotion retrieved successfully',
         data: {
            promotion: promotion.toObject()
         }
      });
   } catch (error) {
      console.error('Error getting promotion by ID:', error);
      return next(new AppError('Internal server error', 500));
   }
};


// Update Promotion Controller
const updatePromotionController = async (req, res, next) => {
   try {
      const promoId = req.params.id;
      if (!promoId) {
         return next(new AppError('Promotion ID is required', 400));
      }
      const { title, description, type, startDate, endDate, products, discountPercentage, template } = req.body;
      // Get promotion by ID using service
      const promotion = await getPromotionByIdService(promoId);
      if (!promotion) {
         return next(new AppError('Promotion not found', 404));
      }

      // create update data object
      const updateData = {};
      if (title) updateData.title = sanitize(title);
      if (description) updateData.description = sanitize(description);
      if (type) {
         const validTypes = ['new stock', 'discount promo', 'buyOneGetOne', 'none'];
         if (!validTypes.includes(type)) {
            return next(new AppError(`Invalid promotion type. Valid types are: ${validTypes.join(', ')}`, 400));
         }
         updateData.type = type;
      }
      if (startDate) updateData.startDate = new Date(startDate);
      if (endDate) updateData.endDate = new Date(endDate);
      if (discountPercentage) {
         const discount = parseInt(discountPercentage, 10);
         if (isNaN(discount) || discount < 0 || discount > 100) {
            return next(new AppError('Invalid discount percentage', 400));
         }
         updateData.discountPercentage = discount;
      }
      if (products && Array.isArray(products)) {
         updateData.products = products.map(product => ({
            product: sanitize(product.product),
            quantity: parseInt(product.quantity, 10),
            mainPrice: parseInt(product.mainPrice, 10),
            promoPrice: parseInt(product.promoPrice, 10)
         }));
      }
      if (template) {
         if (typeof template !== 'string') {
            return next(new AppError('Template must be a string', 400));
         }
         // convert HTML template to image
         const image = await htmlToImage(promotion.title, template);
         if (!image) {
            return next(new AppError('Failed to convert HTML to image', 500));
         }
         // upload image to cloud storage
         const uploadedImage = await uploadImageService(image);
         if (!uploadedImage) {
            return next(new AppError('Failed to upload promotion image', 500));
         }
         // delete old image if exists
         if (promotion.coverImage) {
            await deleteImageService(promotion.coverImage);
         }
         // add cover image URL to update data
         updateData.coverImage = uploadedImage;
      }
      // Update promotion using service
      const updatedPromotion = await updatePromotionService(promoId, updateData);
      if (!updatedPromotion) {
         return next(new AppError('Failed to update promotion', 500));
      }
      // Return response with updated promotion
      return res.status(200).json({
         status: 'success',
         message: 'Promotion updated successfully',
         data: {
            promotion: updatedPromotion.toObject()
         }
      });
   } catch (error) {
      console.error('Error updating promotion:', error);
      return next(new AppError('Internal server error', 500));
   }
};


// Delete Promotion Controller
const deletePromotionController = async (req, res, next) => {
   try {
      const promoId = req.params.id;
      if (!promoId) {
         return next(new AppError('Promotion ID is required', 400));
      }

      // Get promotion by ID using service
      const promotion = await getPromotionByIdService(promoId);
      if (!promotion) {
         return next(new AppError('Promotion not found', 404));
      }

      // Delete promotion coverImage if exists
      if (promotion.coverImage) {
         await deleteImageService(promotion.coverImage);
      }
      // Delete promotion using service
      const deletedPromotion = await deletePromotionService(promoId);
      if (!deletedPromotion) {
         return next(new AppError('Failed to delete promotion', 500));
      }

      // Update or delete products in promotion
      for (const product of deletedPromotion.products) {
         const productData = await getProductByIdService(product.product);
         if (!productData) {
            continue; // Skip if product not found
         }
         // if product is in promotion and deleteAt is set, delete else update product
         if (productData.inPromotion && productData.promoId.toString() === promoId) {
            if (productData.deleteAt) {
               // delete product thumbnail and images if exists
               if (productData.thumbnail) {
                  await deleteImageService(productData.thumbnail);
               }
               for (const image of productData.images) {
                  await deleteImageService(image);
               }
               // delete product
               await deleteProductService(productData._id);
            } else {
               // update product to remove promotion details
               const updatedProduct = await updateProductService(productData._id, {
                  inPromotion: false,
                  promotion: 'none',
                  promoId: null,
                  promoTitle: null,
                  deleteAt: null,
                  quantity: productData.quantity + product.quantity // Restore quantity
               });
               if (!updatedProduct) {
                  return next(new AppError(`Failed to update product ${productData.name} after promotion deletion`, 500));
               }
            }
         }
      }

      // Return response with success message
      return res.status(200).json({
         status: 'success',
         message: 'Promotion deleted successfully',
         data: {
            promotion: deletedPromotion.toObject()
         }
      });
   } catch (error) {
      console.error('Error deleting promotion:', error);
      return next(new AppError('Internal server error', 500));
   }
};


// Export the controller
module.exports = {
    createPromotionController, getActivePromotionController, getPromotionByIdController, updatePromotionController,
    deletePromotionController,
};