const express = require('express');
const { stageOrderController, retrieveOrderController, createOrderController } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();


// Route to stage an order
router.post('/stage', stageOrderController);
router.get('/retrieve/:reference', authMiddleware, retrieveOrderController);
router.post('/:reference', authMiddleware, createOrderController);


// Export the router
module.exports = router;