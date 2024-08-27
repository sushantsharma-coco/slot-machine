// middlewares/errorMiddleware.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Use a default status code if none is set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    // Include stack trace only in development mode
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
