const Order = require('../models/Order');
const productController = require('./product.controller');
const { randomStringGenerator } = require('../utils/randomStringGenerator');
const { populate } = require('dotenv');

const orderController = {};

orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;
    // 재고 확인 & 재고 업데이트
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );
    // 재고가 부족한 아이템이 있으면 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ''
      );
      throw new Error(errorMessage);
    }
    // 오더 생성
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });
    await newOrder.save();
    // 카트 비우기
    res.status(200).json({ status: 'success', orderNum: newOrder.orderNum });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

orderController.getOrder = async (req, res) => {
  try {
    const { userId } = req;
    const orderList = await Order.find({ userId })
      .select('-shipTo -contact -updatedAt -__v')
      .populate({
        path: 'items',
        populate: {
          path: 'productId',
          model: 'Product',
          select: 'image name',
        },
      });
    res.status(200).json({ status: 'success', data: orderList });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

orderController.getOrderList = async (req, res) => {
  try {
    const { page, orderNum } = req.query;
    const cond = orderNum
      ? { orderNum: { $regex: orderNum, $options: 'i' } }
      : {};
    const orderList = await Order.find(cond)
      .populate('userId')
      .populate({
        path: 'items',
        populate: {
          path: 'productId',
          model: 'Product',
          select: 'image name',
        },
      });
    res.status(200).json({ status: 'success', data: orderList });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = orderController;
