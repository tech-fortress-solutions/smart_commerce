const express = require('express');
const { createUserController } = require('../controllers/authController');

const router = express.Router();

router.post('/user/register', createUserController);


module.exports = router;