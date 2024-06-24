const express = require('express');
const cartController = require('../controllers/cart.controller');
const authController = require('../controllers/auth.controller');
const router = express.Router();

router.post('/', authController.authenticate, cartController.addItemToCart);

router.get('/', authController.authenticate, cartController.getCart);

module.exports = router;
