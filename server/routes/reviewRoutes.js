const express = require('express');
const { createReviewController } = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a review
router.post('/:reference', authMiddleware, createReviewController);


// Export the router
module.exports = router;