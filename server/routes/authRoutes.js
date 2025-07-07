const express = require('express');
const { createUserController, loginUserController, logoutUserController, forgotPasswordController,
    resetPasswordController, updateUserAccountController, deleteUserAccountController, createAdminAccountController,
 } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { rateLimiter } = require('../config/rateLimit');

const router = express.Router();

router.post('/user/register', createUserController);
router.post('/user/login', rateLimiter, loginUserController);
router.post('/user/logout', authMiddleware, logoutUserController);
router.post('/user/password/forgot', forgotPasswordController);
router.put('/user/password/reset', resetPasswordController);
router.put('/user/account/update', authMiddleware, updateUserAccountController);
router.delete('/user/account/delete', authMiddleware, deleteUserAccountController);
router.post('/admin/register', createAdminAccountController);


module.exports = router;