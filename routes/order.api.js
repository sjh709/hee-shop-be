const express = require('express');
const orderController = require('../controllers/order.controller');
const authController = require('../controllers/auth.controller');
const router = express.Router();

router.post('/', authController.authenticate, orderController.createOrder);

router.get('/me', authController.authenticate, orderController.getOrder);

module.exports = router;
