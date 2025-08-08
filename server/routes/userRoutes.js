const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getUserOrdersController } = require('../controllers/orderController');

const router = express.Router();


router.get('/reviews', authMiddleware, getUserOrdersController);

// Export the router
module.exports = router;