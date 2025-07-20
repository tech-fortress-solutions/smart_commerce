const express = require('express');
const { createPromotionController, getActivePromotionController, getPromotionByIdController, updatePromotionController } = require('../controllers/promotionController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a new promotion
router.post('/', authMiddleware, createPromotionController);
router.get('/active', getActivePromotionController);
router.put('/update/:id', authMiddleware, updatePromotionController);
router.get('/:id', getPromotionByIdController);


// Export the router
module.exports = router;