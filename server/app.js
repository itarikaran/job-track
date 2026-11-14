const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const companyRoutes = require("./routes/companyRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const csrfOrigin = require("./middleware/csrfMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");
const AppError = require("./utils/AppError");
const allowedOrigins = require("./config/allowedOrigins");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new AppError("Origin is not allowed", 403));
    },
    credentials: true,
  })
);
app.use(csrfOrigin);

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Client connected to Server successfully!",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(errorMiddleware);

module.exports = app;
