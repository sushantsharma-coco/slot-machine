const User = require("../models/userSchema.js");
const Wallet = require("../models/wallet.model.js");
const { ApiResponse } = require("../utils/ApiResponse.utils");

const wallet = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { walletBalance } = req.body;

    const wallet = await Wallet.create({
      user: req.user._id,
      walletBalance,
    });

    res
      .status(200)
      .send(new ApiResponse(200, wallet, "Wallet created successfully"));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .send(
        new ApiError(
          error.statusCode || 500,
          error.message || "Internal server error"
        )
      );
  }
};

module.exports = wallet;
