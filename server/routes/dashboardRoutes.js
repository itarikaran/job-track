const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getStats,
  getRecent,
  getUpcoming,
  getCharts,
} = require("../controllers/dashboardController");

const router = express.Router();
router.use(protect);
router.get("/stats", getStats);
router.get("/recent", getRecent);
router.get("/upcoming", getUpcoming);
router.get("/charts", getCharts);

module.exports = router;
