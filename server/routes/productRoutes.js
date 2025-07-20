const express = require('express');
const { createProductController, getAllProductsController, getProductsByCategoryController, getProductByIdController,
    updateProductController, deleteProductController, searchProductsController
 } = require('../controllers/productController');
const upload = require('../middleware/uploadMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// product routes
router.post('/create', authMiddleware, upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'images', maxCount: 10 }]), createProductController);
router.get('/all', getAllProductsController);
router.get('/search', searchProductsController);
router.delete('/delete/:id', authMiddleware, deleteProductController);
router.put('/update/:id', authMiddleware, upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'images', maxCount: 10 }]), updateProductController);
router.get('/category/:id', getProductsByCategoryController);
router.get('/:id', getProductByIdController);

// Export the router
module.exports = router;