const User = require("../models/userSchema.js");
const jwt = require("jsonwebtoken");
const { ApiError } = require("../utils/ApiError.utils");
const dotenv = require("dotenv");
dotenv.config();
const auth = async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) throw new ApiError(401, "Access token not found");

    const tokenData = await jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!tokenData || !tokenData.id) throw new ApiError(401, "Invalid token");

    const user = await User.findById(tokenData.id);

    if (!user) throw new ApiError(404, "User not found, try logging in");

    req.user = user;
    next();
  } catch (error) {
    console.error("Error occurred:", error.message);

    return res.status(error?.statusCode || 401).send({
      statusCode: error?.statusCode || 401,
      data: {
        message: error?.message || "Unauthorized user",
        data: null,
      },
      success: false,
    });
  }
};

module.exports = auth;
