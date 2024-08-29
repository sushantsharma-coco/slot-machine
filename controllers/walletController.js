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

const addBalance = async (req, res) => {
  try {
    const { walletBalance } = req.body; // Extract balance from request body

    // Validate that walletBalance is provided and is a positive number
    if (walletBalance == null || walletBalance <= 0) {
      throw new ApiError(400, "Invalid wallet balance value");
    }

    // Assuming user is authenticated and available in req.user
    const userId = req.user._id;

    // Find or create a wallet for the user
    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      // If wallet does not exist, create a new one
      wallet = new Wallet({
        user: userId,
        walletBalance: 0, // Initialize with 0 if new
      });
    }

    // Update the wallet balance
    wallet.walletBalance += walletBalance;
    await wallet.save();

    // Send the updated wallet info along with success message
    res.status(200).send({
      statusCode: 200,
      data: wallet,
      message: "Wallet balance updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Add wallet balance error:", error.message);
    res.status(error?.statusCode || 500).send({
      statusCode: error?.statusCode || 500,
      data: {
        message: error?.message || "Internal server error",
        data: null,
      },
      success: false,
    });
  }
};

module.exports = { wallet, addBalance };
