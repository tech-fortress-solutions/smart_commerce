const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createCategoryController, getAllCategoriesController, updateCategoryController, deleteCategoryController } = require('../controllers/categoryController');

const router = express.Router();

// category create, update, get and delete routes
router.post('/create', authMiddleware, upload.single('image'), createCategoryController);
router.get('/all', getAllCategoriesController);
router.put('/update/:id', authMiddleware, upload.single('image'), updateCategoryController);
router.delete('/delete/:id', authMiddleware, deleteCategoryController);


// Export the router
module.exports = router;