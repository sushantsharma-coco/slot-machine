const User = require("../models/userSchema.js");
const Wallet = require("../models/wallet.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ApiError } = require("../utils/ApiError.utils.js");
const { ApiResponse } = require("../utils/ApiResponse.utils");
const dotenv = require("dotenv");
dotenv.config();

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

// Helper function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .send(new ApiError(400, "Please fill in all required fields"));
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .send(new ApiError(400, "User with this email already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res
      .status(201)
      .send(new ApiResponse(201, user, "User registered successfully"));
  } catch (error) {
    console.error("Registration error:", error);
    next(new ApiError(500, error.message));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send(new ApiError(400, "Please fill in all required fields"));
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .send(new ApiError(400, "Invalid email or password"));
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", refreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).send(
      new ApiResponse(
        200,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          tokens: { accessToken, refreshToken },
        },
        "Login successful"
      )
    );
  } catch (error) {
    console.error("Login error:", error);
    next(new ApiError(500, error.message));
  }
};

const refreshAccessToken = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).send(new ApiError(401, "No refresh token provided"));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(403).send(new ApiError(403, "Invalid refresh token"));
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", newRefreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .send(new ApiResponse(200, { accessToken }, "Access token refreshed"));
  } catch (error) {
    console.error("Refresh token error:", error);
    next(new ApiError(500, error.message));
  }
};

const logout = (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).send(new ApiResponse(200, null, "Logout successful"));
  } catch (error) {
    console.error("Logout error:", error);
    next(new ApiError(500, error.message));
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user?._id) {
      throw new ApiError(401, "Invalid user credentials");
    }
    // No need to query the database again if req.user is already populated
    const user = req.user;
    // Fetch the user's wallet balance
    const wallet = await Wallet.findOne({ user: req.user._id }).select(
      "walletBalance"
    );

    // If wallet is not found, initialize the balance to 0
    const walletBalance = wallet ? wallet.walletBalance : 0;

    const userWithWallet = {
      ...req.user._doc, // Spread the user's fields into a new object
      walletBalance, // Add the wallet balance field directly within the user object
    };

    // Send the user object with wallet balance inside it
    res.status(200).send({
      statusCode: 200,
      data: userWithWallet,
      message: "Current user fetched successfully",
      success: true,
    });
  } catch (error) {
    console.error("Get current user error:", error.message);
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

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
};
