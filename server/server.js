const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const jobRoutes = require("./routes/jobRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Job-Track API is running" });
});

app.use("/api/jobs", jobRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();