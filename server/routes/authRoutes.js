const express = require('express');
const { createUserController, loginUserController, logoutUserController } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/user/register', createUserController);
router.post('/user/login', loginUserController);
router.post('/user/logout', authMiddleware, logoutUserController);


module.exports = router;