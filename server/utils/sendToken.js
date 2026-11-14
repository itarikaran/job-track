/**
 * Sends JWT as HttpOnly cookie and responds with user data.
 * Used by auth controllers (login/register).
 */
const jwt = require("jsonwebtoken");

/**
 * Sends JWT as HttpOnly cookie and responds with user data.
 * Used by auth controllers (login/register).
 */
const durationToMilliseconds = (duration) => {
  const match = String(duration).match(/^(\d+)([smhd])$/i);
  if (!match) return 24 * 60 * 60 * 1000;
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return Number(match[1]) * multipliers[match[2].toLowerCase()];
};

const sendToken = (user, statusCode, res) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn, algorithm: "HS256" }
  );

  const cookieOptions = {
    maxAge: durationToMilliseconds(expiresIn),
    expires: new Date(Date.now() + durationToMilliseconds(expiresIn)),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  res.status(statusCode).cookie("token", token, cookieOptions);
  res.status(statusCode).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

module.exports = sendToken;