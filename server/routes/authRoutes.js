const express = require('express');
const { createUserController, loginUserController } = require('../controllers/authController');

const router = express.Router();

router.post('/user/register', createUserController);
router.post('/user/login', loginUserController);


module.exports = router;