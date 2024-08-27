const User = require("../models/userSchema.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorHandler = require("../middlewares/errorMiddleware");

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
    { expiresIn: "1d" }
  );

  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  // Check if any required fields are missing
  if (!name || !email || !password) {
    return res.status(400).json({
      userExists: false,
      statusCode: 400,
      success: false,
      message: "Please fill in all required fields",
    });
  }
  try {
    // Check if the user already exists based on email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        userExists: true,
        statusCode: 400,
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    // Respond with success message and additional information
    res.status(201).json({
      userExists: false,
      statusCode: 201,
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error); // Log the error for debugging
    errorHandler(error, req, res, next); // Use the errorHandler middleware
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Convert email to lowercase to avoid case sensitivity issues
  const normalizedEmail = email.toLowerCase();

  if (!email || !password) {
    return res.status(400).json({
      userExists: false,
      statusCode: 400,
      success: false,
      message: "Please fill in all required fields",
    });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({
        userExists: false,
        statusCode: 400,
        success: false,
        message: "Invalid email or password",
      });
    }

    // Debug: Print out the passwords for comparison
    console.log("Entered password:", password);
    console.log("Hashed password from DB:", user.password);

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        userExists: true,
        statusCode: 400,
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Set cookies for tokens
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production for HTTPS
      maxAge: 3600000, // 1 hour
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production for HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Respond with success message and tokens
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
      userExists: true,
      statusCode: 200,
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    errorHandler(error, req, res, next);
  }
};

const refreshAccessToken = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: "Access token refreshed", accessToken });
  } catch (error) {
    errorHandler(error, req, res, next); // Use the errorHandler middleware
  }
};

const logout = (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logout successful" });
  } catch (error) {
    errorHandler(error, req, res, next); // Use the errorHandler middleware
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
};
