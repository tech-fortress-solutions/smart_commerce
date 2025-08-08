const express = require('express');
const { createReviewController, getProductReviewsController, updateReviewController, deleteReviewController,
    getAllReviewsController, getUserReviewsController
 } = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a review
router.get('/all', authMiddleware, getAllReviewsController);
router.get('/user', authMiddleware, getUserReviewsController);
router.post('/:reference', authMiddleware, createReviewController);
router.get('/:productId', getProductReviewsController);
router.put('/:reviewId', authMiddleware, updateReviewController);
router.delete('/:reviewId', authMiddleware, deleteReviewController);


// Export the router
module.exports = router;