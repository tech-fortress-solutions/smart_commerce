const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createCategoryController } = require('../controllers/categoryController');

const router = express.Router();

// category create, update, get and delete routes
router.post('/create', authMiddleware, upload.single('image'), createCategoryController);


// Export the router
module.exports = router;