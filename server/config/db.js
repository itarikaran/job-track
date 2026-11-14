const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.info("MongoDB connected", {
      host: mongoose.connection.host,
      database: mongoose.connection.name,
    });
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // Do not exit; server can still start for route testing
  }
};

module.exports = connectDB;