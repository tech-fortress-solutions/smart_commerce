const { createReviewService, getReviewsByProductService, validateReviewService } = require('../services/reviewService');
const { getProductByIdService, updateProductService } = require('../services/productService');
const { getOrderByReferenceService, updateOrderService } = require('../services/orderService');
const { AppError } = require('../utils/error');
const { sanitize } = require('../utils/helper');


// Create Review Controller
const createReviewController = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return next(new AppError('User not authenticated', 401));
        }

        if (user.role !== 'user') {
            return next(new AppError('Only users can create reviews', 403));
        }

        const { reference } = req.params;
        if (!reference) {
            return next(new AppError("No reference provided", 400));
        }

        const { product, rating, comment } = req.body;
        if (!product || !rating || !comment) {
            return next(new AppError("Required fields are missing", 400));
        }

        // Check if user has already reviewed the product
        const hasReviewed = await validateReviewService(user._id, product);
        if (hasReviewed) {
            return next(new AppError("You have already reviewed this product", 403));
        }

        // Get product from database and ensure product was bought by user before allowing review
        const order = await getOrderByReferenceService(reference);
        if (!order) {
            return next(new AppError("Order not found", 404));
        }
        // Check if product was purchased in the order
        const productPurchased = order.products.some(p => p.product.toString() === product);
        if (!productPurchased || order.status !== 'paid') {
            return next(new AppError("You can only review products you have purchased", 403));
        }

        // Update order with user id
        const updatedOrder = await updateOrderService(reference, { clientId: user._id });
        if (!updatedOrder) {
            return next(new AppError('Failed to update order with user ID', 500));
        }

        // Retrieve product from database
        const productData = await getProductByIdService(product);
        if (!productData) {
            return next(new AppError("Product not found", 404));
        }
        // Create review data
        const reviewData = {
            product: productData._id,
            user: user._id,
            rating: parseInt(sanitize(rating)),
            comment: sanitize(comment)
        };
        // Create review using service
        const newReview = await createReviewService(reviewData);
        if (!newReview) {
            return next(new AppError('Failed to create review', 500));
        }

        // calculate product review and get number of reviews
        const reviews = await getReviewsByProductService(productData._id);
        if (!reviews || reviews.length === 0) {
            return next(new AppError('No reviews found for this product', 404));
        }
        const totalRating = reviews.reduce((total, review) => total + review.rating, 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);

        // Update product with new average rating and number of reviews
        const updatedProduct = await updateProductService(productData._id, {
            rating: averageRating,
            numberOfReviews: reviews.length
        });
        if (!updatedProduct) {
            return next(new AppError('Failed to update product rating', 500));
        }
        // Return response with created review and updated product
        res.status(201).json({
            status: 'success',
            message: 'Review created successfully',
            data: newReview.toObject()
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error creating review:', error);
        return next(new AppError('Failed to create review', 500)); // Handle other errors gracefully
    }
};


// get reviews by product controller
const getProductReviewsController = async (req, res, next) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return next(new AppError('No product ID provided', 400));
        }

        // Get reviews by product ID using service
        const reviews = await getReviewsByProductService(productId);
        if (!reviews || reviews.length === 0) {
            return next(new AppError('No reviews found for this product', 404));
        }
        // Return response with the list of reviews
        res.status(200).json({
            status: 'success', 
            message: 'Reviews fetched successfully',
            data: reviews.map(review => review.toObject())
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error fetching product reviews:', error);
        return next(new AppError('Failed to fetch product reviews', 500)); // Handle other errors gracefully
    }
};


// export functions
module.exports = {
    createReviewController, getProductReviewsController,
}