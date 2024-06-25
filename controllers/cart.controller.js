const { populate } = require('dotenv');
const Cart = require('../models/Cart');

const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    // 유저를 가지고 카트 찾기
    let cart = await Cart.findOne({ userId });
    // 유저가 만든 카트가 없다면 만들어주기
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }
    // 이미 카트에 들어가있는 아이템이면 에러
    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size
    );
    if (existItem) {
      throw new Error('상품이 이미 담겨있습니다.');
    }
    // 카트에 아이템 추가
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    res
      .status(200)
      .json({ status: 'success', data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

cartController.getCart = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items',
      populate: {
        path: 'productId',
        model: 'Product',
      },
    });
    res.status(200).json({ status: 'success', data: cart.items });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

cartController.deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const cart = await Cart.findOne({ userId });
    cart.items = cart.items.filter((item) => !item._id.equals(id));
    await cart.save();
    res.status(200).json({ status: 'success', cartItemQty: cart.items.length });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

cartController.editCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { qty } = req.body;
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items',
      populate: {
        path: 'productId',
        model: 'Product',
      },
    });
    if (!cart) {
      throw new Error('사용자의 카트를 찾을 수 없습니다.');
    }
    const index = cart.items.findIndex((item) => item._id.equals(id));
    if (index === -1) {
      throw new Error('상품을 찾을 수 없습니다.');
    }
    cart.items[index].qty = qty;
    await cart.save();
    res.status(200).json({ status: 'success', data: cart.items });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

cartController.getCartQty = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error('사용자의 카트를 찾을 수 없습니다.');
    }
    res.status(200).json({ status: 'success', qty: cart.items.length });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = cartController;
