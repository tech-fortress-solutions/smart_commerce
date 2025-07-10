const express = require('express');
const { stageOrderController, retrieveOrderController, createOrderController, getAllOrdersController,
    getOrderByReferenceController, confirmPurchaseController, deleteOrderController, updateOrderController,
 } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();


// Route to stage an order
router.post('/stage', stageOrderController);
router.get('/', authMiddleware, getAllOrdersController);
router.put('/confirm/:reference', authMiddleware, confirmPurchaseController);
router.get('/retrieve/:reference', authMiddleware, retrieveOrderController);
router.post('/:reference', authMiddleware, createOrderController);
router.get('/:reference', authMiddleware, getOrderByReferenceController);
router.delete('/:reference', authMiddleware, deleteOrderController);
router.put('/:reference', authMiddleware, updateOrderController);



// Export the router
module.exports = router;