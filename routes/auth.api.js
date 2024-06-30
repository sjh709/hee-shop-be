const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// 로그인
router.post('/login', authController.loginWithEmail);

// 구글로그인
router.post('/google', authController.loginWithGoogle);

module.exports = router;
