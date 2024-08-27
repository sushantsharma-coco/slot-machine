const User = require("../models/userSchema.js");
const errorHandler = require("../middlewares/errorMiddleware.js");
const Wallet = require("../models/wallet.model.js");
const wallet = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { walletBalance } = req.body;

    console.log(req.user);

    const wallet = await Wallet.create({
      user: req.user._id,
      walletBalance,
    });

    res.status(200).json({
      wallet,
    });
  } catch (error) {
    errorHandler(error, req, res, next); // Use the errorHandler middleware
  }
};

module.exports = wallet;
