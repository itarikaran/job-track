const AppError = require("../utils/AppError");

const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (
    err.name === "MongooseServerSelectionError" ||
    err.name === "MongoServerSelectionError" ||
    /buffering timed out/i.test(err.message || "")
  ) {
    error = new AppError(
      "Database is unavailable. Allow this computer in MongoDB Atlas Network Access, then try again.",
      503
    );
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new AppError(message, 409);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    error = new AppError(message, 401);
  }
  if (err.name === "TokenExpiredError") {
    const message = "Token expired. Please log in again.";
    error = new AppError(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};

module.exports = errorMiddleware;