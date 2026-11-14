const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
} = require("../controllers/authController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const {
  registerSchema,
  loginSchema,
  profileSchema,
} = require("../validation/authSchema");

const router = express.Router();

// Rate limiting for auth write routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post(
  "/register",
  authLimiter,
  validateMiddleware(registerSchema),
  register
);
router.post(
  "/login",
  authLimiter,
  validateMiddleware(loginSchema),
  login
);

// Private routes
router.post("/logout", protect, logout);
router.get("/me", optionalProtect, getMe);
router.put(
  "/profile",
  protect,
  validateMiddleware(profileSchema),
  updateProfile
);

module.exports = router;