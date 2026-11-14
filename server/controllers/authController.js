const User = require("../models/User");
const AppError = require("../utils/AppError");
const sendToken = require("../utils/sendToken");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("User already exists with this email", 409));
    }

    const user = await User.create({ name, email, password });

    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new AppError("Invalid email or password", 401));
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      maxAge: 0,
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(200).json({
        success: true,
        user: null,
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (name) user.name = name;

    if (email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: user._id },
      });
      if (emailExists) {
        return next(new AppError("Email already in use", 409));
      }
      user.email = email;
    }

    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return next(new AppError("Current password is incorrect", 401));
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};