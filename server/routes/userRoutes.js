const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getUserOrdersController } = require('../controllers/orderController');
const { testRouteController } = require("../controllers/authController"); // Importing authController for potential future use

const router = express.Router();


router.get('/orders', authMiddleware, getUserOrdersController);
router.get('/test', testRouteController);

// Export the router
module.exports = router;