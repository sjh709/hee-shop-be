const express = require('express');
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// 회원가입
router.post('/', userController.createUser);
// 토큰 로그인
router.get('/me', authController.authenticate, userController.getUser);

module.exports = router;
