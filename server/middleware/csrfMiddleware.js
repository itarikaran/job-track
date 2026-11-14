const AppError = require("../utils/AppError");
const allowedOrigins = require("../config/allowedOrigins");

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const csrfOrigin = (req, res, next) => {
  if (!unsafeMethods.has(req.method) || req.method === "OPTIONS") {
    return next();
  }

  const requestOrigin = req.get("origin");
  const referer = req.get("referer");
  let validOrigin = Boolean(requestOrigin) && allowedOrigins.includes(requestOrigin);

  if (!validOrigin && !requestOrigin && referer) {
    try {
      validOrigin = allowedOrigins.includes(new URL(referer).origin);
    } catch (err) {
      validOrigin = false;
    }
  }

  if (!validOrigin) {
    return next(new AppError("Invalid request origin", 403));
  }

  next();
};

module.exports = csrfOrigin;
