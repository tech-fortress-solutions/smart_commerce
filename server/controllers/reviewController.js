const { createReviewService, getReviewsByProductService, validateReviewService, getReviewByIdService,
    updateReviewService, deleteReviewService, getAllReviewsService, getUserReviewsService
 } = require('../services/reviewService');
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
        const updatedOrder = await updateOrderService(reference, { clientId: user._id, clientName: user.firstname + ' ' + user.lastname });
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
            comment: sanitize(comment),
            reference: reference,
        };
        // Create review using service
        const newReview = await createReviewService(reviewData);
        if (!newReview) {
            return next(new AppError('Failed to create review', 500));
        }


        // Update product with new average rating and number of reviews
        const updatedProduct = await updateProductService(productData._id, {
            $inc: {
                totalRating: newReview.rating, // Increment total rating by new review rating
                numReviews: 1 // Increment number of reviews
            }
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
        if (!reviews) {
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


// Update Review Controller
const updateReviewController = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment, response } = req.body;
        if (!reviewId) {
            return next(new AppError('No review ID provided', 400));
        }
        if (!rating && !comment && !response) {
            return next(new AppError('No fields to update provided', 400));
        }

        // Get review by ID using service
        const review = await getReviewByIdService(reviewId);
        if (!review) {
            return next(new AppError('Review not found', 404));
        }

        // create update data object
        const updateData = {};
        if (rating) {
            updateData.rating = parseInt(sanitize(rating));
        }
        if (comment) {
            updateData.comment = sanitize(comment);
        }
        if (response) {
            // Check if user is admin or has permission to respond
            if (!req.user || req.user.role !== 'admin') {
                return next(new AppError('Only admins can respond to reviews', 403));
            }
            updateData.response = {
                comment: sanitize(response.comment),
                responder: process.env.BRAND_NAME || 'Smart Commerce',
                responderId: req.user._id,
                createdAt: new Date()
            }
        }

        // Update review using service
        const updatedReview = await updateReviewService(reviewId, updateData);
        if (!updatedReview) {
            return next(new AppError('Failed to update review', 500));
        }
        // Update product rating if rating was updated
        if (rating) {
            const updatedProduct = await updateProductService(review.product, {
                $inc: {
                    totalRating: updatedReview.rating - review.rating, // Adjust total rating based on new rating
                    numReviews: 0 // Number of reviews remains the same
                }
            });
            if (!updatedProduct) {
                return next(new AppError('Failed to update product rating', 500));
            }
        }
        // Return response with updated review
        res.status(200).json({
            status: 'success',
            message: 'Review updated successfully',
            data: updatedReview.toObject()
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error updating review:', error);
        return next(new AppError('Failed to update review', 500)); // Handle other errors gracefully
    }
};


// Delete Review Controller
const deleteReviewController = async (req, res, next) => {
    try {
        const {reviewId} = req.params;
        if (!reviewId) {
            return next(new AppError('No review ID provided', 400));
        }

        const user = req.user;
        if (!user) {
            return next(new AppError('User not authenticated', 401));
        }
        if (user.role !== 'admin') {
            return next(new AppError('Only admins can delete reviews', 403));
        }

        // Get review by ID using service
        const review = await getReviewByIdService(reviewId);
        if (!review) {
            return next(new AppError('Review not found', 404));
        }

        // Delete review using service
        const deletedReview = await deleteReviewService(reviewId);
        if (!deletedReview) {
            return next(new AppError('Failed to delete review', 500));
        }
        // Update product rating and number of reviews
        const updatedProduct = await updateProductService(review.product, {
            $inc: {
                totalRating: -review.rating, // Decrease total rating by deleted review rating
                numReviews: -1 // Decrease number of reviews by 1
            }
        });
        if (!updatedProduct) {
            return next(new AppError('Failed to update product rating', 500));
        }
        // Return response with success message
        res.status(200).json({
            status: 'success',
            message: 'Review deleted successfully',
            data: deletedReview.toObject()
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error deleting review:', error);
        return next(new AppError('Failed to delete review', 500)); // Handle other errors gracefully
    }
};


// Get All Reviews Controller
const getAllReviewsController = async (req, res, next) => {
    try {
        // Verify user is admin
        const user = req.user;
        if (!user) {
            return next(new AppError('User not authenticated', 401));
        }
        if (user.role !== 'admin') {
            return next(new AppError('Only admins can view all reviews', 403));
        }
        // Get all reviews using service
        const reviews = await getAllReviewsService();
        if (reviews.length > 0) {
            // Return response with list of reviews
            return res.status(200).json({
                status: 'success',
                message: 'All reviews fetched successfully',
                data: reviews.map(review => review.toObject())
            });
        } else {
            // Return empty array if no reviews found
            return res.status(200).json({
                status: 'success',
                data: []
            });
        }
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error fetching all reviews:', error);
        return next(new AppError('Failed to fetch all reviews', 500)); // Handle other errors gracefully
    }
}


// Get User's Reviews Controller
const getUserReviewsController = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return next(new AppError('User not authenticated', 401));
        }

        // Get user's reviews using service
        const reviews = await getUserReviewsService(user._id);
        if (!reviews) {
            return next(new AppError('No reviews found for this user', 404));
        }

        if (reviews.length === 0) {
            return res.status(200).json({
                status: 'success',
                message: 'No reviews found for this user',
                data: []
            });
        }
        // Return response with user's reviews
        res.status(200).json({
            status: 'success',
            message: 'User reviews fetched successfully',
            data: reviews.map(review => review.toObject())
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error); // Re-throw custom AppError
        }
        console.error('Error fetching user reviews:', error);
        return next(new AppError('Failed to fetch user reviews', 500)); // Handle other errors gracefully
    }
};


// export functions
module.exports = {
    createReviewController, getProductReviewsController, updateReviewController, deleteReviewController,
    getAllReviewsController, getUserReviewsController,
}