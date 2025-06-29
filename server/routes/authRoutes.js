const express = require('express');
const { createUserController, loginUserController, logoutUserController, forgotPasswordController,
    resetPasswordController
 } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/user/register', createUserController);
router.post('/user/login', loginUserController);
router.post('/user/logout', authMiddleware, logoutUserController);
router.post('/user/password/forgot', forgotPasswordController);
router.put('/user/password/reset', resetPasswordController);


module.exports = router;