const Product = require('../models/Product');

const productController = {};

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;
    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });
    await product.save();
    res.status(200).json({ status: 'success', product });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const { page, name, pageSize } = req.query;
    const cond = name
      ? { name: { $regex: name, $options: 'i' }, isDeleted: false }
      : { isDeleted: false };
    let query = Product.find(cond).select('-createdAt -__v');
    let response = { status: 'success' };
    if (page) {
      query.skip((page - 1) * pageSize).limit(pageSize);
      const totalItemNum = await Product.find(cond).count();
      const totalPageNum = Math.ceil(totalItemNum / pageSize);
      response.totalPageNum = totalPageNum;
    }

    const productList = await query.exec();
    response.data = productList;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      sku,
      name,
      size,
      image,
      price,
      description,
      category,
      stock,
      status,
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { sku, name, size, image, price, description, category, stock, status },
      { new: true }
    );
    if (!product) {
      throw new Error('상품이 존재하지 않습니다.');
    }
    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDeleted: true }
    );
    if (!product) {
      throw new Error('상품이 존재하지 않습니다.');
    }
    res.status(200).json({ status: 'success' });
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

productController.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(
      { _id: productId },
      '-createdAt -__v'
    );
    if (!product) {
      throw new Error('상품이 존재하지 않습니다.');
    }
    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

productController.checkStock = async (item) => {
  // 내가 사려는 아이템 재고 정보 들고오기
  const product = await Product.findById(item.productId);
  // 내가 사려는 아이템 qty, 재고 비교
  // 재고가 불충분하면 메세지와 함께 데이터 반환
  if (product.stock[item.size] < item.qty) {
    return {
      isVerify: false,
      message: `${product.name}의 ${item.size} 재고가 부족합니다.`,
    };
  }
  // 충분하면 재고 - qty
  const newStock = { ...product.stock };
  newStock[item.size] -= item.qty;
  product.stock = newStock;
  await product.save();
  return { isVerify: true };
};

productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = [];
  // 재고 확인
  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item);
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
      return stockCheck;
    })
  );

  return insufficientStockItems;
};

module.exports = productController;
