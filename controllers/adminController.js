const User = require("../models/userSchema.js");
const Game = require("../models/game.model.js");
const { ApiError } = require("../utils/ApiError.utils.js");
const { ApiResponse } = require("../utils/ApiResponse.utils");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const adminLogin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send(new ApiError(400, "Please fill in all required fields"));
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
      return res
        .status(400)
        .send(new ApiError(400, "Invalid email or password"));
    }

    // Generate a JWT access token for the admin
    const accessToken = jwt.sign(
      { email: adminEmail, role: process.env.ADMIN_ROLE },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set the access token in a cookie
    res.cookie("accessToken", accessToken, { httpOnly: true });

    res
      .status(200)
      .send(
        new ApiResponse(
          200,
          { email: adminEmail, accessToken },
          "Admin logged in successfully"
        )
      );
  } catch (error) {
    console.error("Admin login error:", error);
    next(new ApiError(500, "Internal Server Error"));
  }
};

const getAllUsersWithGameStats = async (req, res, next) => {
  try {
    // Fetch all users
    const users = await User.find().select("name"); // Added email to the selection

    // Aggregate game statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const games = await Game.find({ playerId: user._id });

        const totalGamesPlayed = games.length;
        const totalWins = games.filter(
          (game) => game.gameState.wonAmount > 0
        ).length;
        const totalLosses = games.filter(
          (game) => game.gameState.lostAmount > 0
        ).length;

        return {
          name: user.name,
          totalGamesPlayed,
          totalWins,
          totalLosses,
        };
      })
    );

    // Send the response
    res
      .status(200)
      .send(
        new ApiResponse(
          200,
          usersWithStats,
          "Users and their game stats fetched successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching users with game stats:", error);
    next(new ApiError(500, "Failed to fetch users with game stats"));
  }
};

const adminLogout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken");

    res.status(200).send(new ApiResponse(200, null, "Logout successful"));
  } catch (error) {
    console.error("Admin logout error:", error);
    next(new ApiError(500, "Internal Server Error"));
  }
};

module.exports = { adminLogin, getAllUsersWithGameStats, adminLogout };
