const express = require('express');
const { createPromotionController } = require('../controllers/promotionController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a new promotion
router.post('/', authMiddleware, createPromotionController);


// Export the router
module.exports = router;