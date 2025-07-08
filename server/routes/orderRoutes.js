const express = require('express');
const { stageOrderController } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();


// Route to stage an order
router.post('/stage', stageOrderController);


// Export the router
module.exports = router;