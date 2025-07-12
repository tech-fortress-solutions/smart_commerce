const express = require('express');
const { createReviewController, getProductReviewsController, updateReviewController } = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a review
router.post('/:reference', authMiddleware, createReviewController);
router.get('/:productId', getProductReviewsController);
router.put('/:reviewId', authMiddleware, updateReviewController);


// Export the router
module.exports = router;