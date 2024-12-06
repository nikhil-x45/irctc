const express = require('express');
const router = express.Router();
const { userAuth, adminAuth } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);