const express = require("express");
const protect = require("../middlewares/authMiddleware.js");
const {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
} = require("../controllers/authController.js");

const router = express.Router();

// User Registration
router.route("/register").post(register);

// User Login
router.route("/login").post(login);

// Refresh Access Token
router.route("/token/refresh").post(refreshAccessToken);

// Apply protect middleware for secured routes
router.use(protect);

// User Logout
router.route("/logout").post(logout);

// Get Current User
router.route("/me").get(getCurrentUser);

module.exports = { router };
