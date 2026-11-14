const productionOrigins = ["https://job-track-jt.vercel.app"];
const developmentOrigins = ["http://localhost:5173", "http://localhost:5174"];

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = allowedOrigins.length
  ? allowedOrigins
  : process.env.NODE_ENV === "production"
    ? productionOrigins
    : developmentOrigins;