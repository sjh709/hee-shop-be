const User = require('../models/User');
const bcrypt = require('bcryptjs');

const authController = {};

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }, '-createdAt -updatedAt -__v');
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const token = await user.generateToken();
        return res.status(200).json({ status: 'success', user, token });
      }
      throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
    throw new Error('이메일이 존재하지 않습니다.');
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = authController;
