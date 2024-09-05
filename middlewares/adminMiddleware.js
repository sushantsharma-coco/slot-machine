const jwt = require("jsonwebtoken");
const { ApiError } = require("../utils/ApiError.utils.js");
const dotenv = require("dotenv");
dotenv.config();

const adminAuth = (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) throw new ApiError(401, "Access token not found");

    const tokenData = jwt.verify(accessToken, process.env.JWT_SECRET);

    if (!tokenData || tokenData.role !== process.env.ADMIN_ROLE) {
      throw new ApiError(403, "Forbidden: Admin access required");
    }

    req.user = tokenData; // Set user data in the request object for further use
    next();
  } catch (error) {
    console.error("Error occurred:", error.message);

    return res.status(error?.statusCode || 403).send({
      statusCode: error?.statusCode || 403,
      data: {
        message: error?.message || "Forbidden: Admin access required",
        data: null,
      },
      success: false,
    });
  }
};

module.exports = adminAuth;
