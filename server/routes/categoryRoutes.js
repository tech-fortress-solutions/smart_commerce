const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createCategoryController, getAllCategoriesController } = require('../controllers/categoryController');

const router = express.Router();

// category create, update, get and delete routes
router.post('/create', authMiddleware, upload.single('image'), createCategoryController);
router.get('/all', getAllCategoriesController);


// Export the router
module.exports = router;