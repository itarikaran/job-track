require("dotenv").config();

const connectDB = require("./config/db");
const app = require("./app");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured before starting the server");
}

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});