const express = require('express');
const cartController = require('../controllers/cart.controller');
const authController = require('../controllers/auth.controller');
const router = express.Router();

router.post('/', authController.authenticate, cartController.addItemToCart);

router.get('/', authController.authenticate, cartController.getCart);

router.delete(
  '/:id',
  authController.authenticate,
  cartController.deleteCartItem
);

router.put('/:id', authController.authenticate, cartController.editCartItem);

router.get('/qty', authController.authenticate, cartController.getCartQty);

module.exports = router;
