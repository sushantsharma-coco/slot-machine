const User = require("../models/userSchema.js");
const Wallet = require("../models/wallet.model.js");
const { ApiError } = require("../utils/ApiError.utils.js"); // Assuming you have an ApiError utility
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

const addBalance = async (req, res, next) => {
  try {
    const { walletBalance } = req.body; // Extract balance from request body
    // Validate that walletBalance is provided and is a positive number
    if (walletBalance == null || walletBalance <= 0) {
      throw new ApiError(400, "Invalid wallet balance value");
    }

    const userId = req.user._id;

    // Find and Update  wallet for the user
    let wallet = await Wallet.findOneAndUpdate(
      { user: userId },
      { $inc: { walletBalance: walletBalance } }
    );

    // Update the wallet balance
    await wallet.save();

    // Send the updated wallet info along with success message
    res
      .status(200)
      .send(
        new ApiResponse(200, wallet, "Wallet balance updated successfully")
      );
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

module.exports = { wallet, addBalance };
