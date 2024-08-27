const User = require("../models/userSchema.js");
const errorHandler = require("../middlewares/errorMiddleware.js");

const currentUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id, role: "user" }).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        userExists: false,
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        userExists: true,
        statusCode: 403,
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      userExists: true,
      statusCode: 200,
      success: true,
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    next(errorHandler);
  }
};

module.exports = currentUser;
