const express = require('express');
const { createProductController } = require('../controllers/productController');
const upload = require('../middleware/uploadMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// product routes
router.post('/create', authMiddleware, upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'images', maxCount: 10 }]), createProductController);

// Export the router
module.exports = router;