const express = require('express');
const { createReviewController, getProductReviewsController } = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a review
router.post('/:reference', authMiddleware, createReviewController);
router.get('/:productId', getProductReviewsController);


// Export the router
module.exports = router;