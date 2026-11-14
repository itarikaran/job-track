const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// Protect routes - verify HttpOnly cookie JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError("Not authorized to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    req.user = { _id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    return next(new AppError("Not authorized to access this route", 401));
  }
});

// Session check: missing cookie is anonymous, invalid cookie is rejected.
const optionalProtect = asyncHandler(async (req, res, next) => {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    req.user = { _id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    return next(new AppError("Not authorized to access this route", 401));
  }
});

module.exports = { protect, optionalProtect };