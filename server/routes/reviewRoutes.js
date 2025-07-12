const express = require('express');
const { createReviewController, getProductReviewsController, updateReviewController, deleteReviewController } = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a review
router.post('/:reference', authMiddleware, createReviewController);
router.get('/:productId', getProductReviewsController);
router.put('/:reviewId', authMiddleware, updateReviewController);
router.delete('/:reviewId', authMiddleware, deleteReviewController);


// Export the router
module.exports = router;