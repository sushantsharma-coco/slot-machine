const errorHandler = require("../middlewares/errorMiddleware");

const currentUser = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        userExists: false,
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      userExists: true,
      statusCode: 200,
      success: true,
      message: "User retrieved successfully",
    });
  } catch (error) {
    errorHandler(error, req, res, next);
  }
};

module.exports = currentUser;
