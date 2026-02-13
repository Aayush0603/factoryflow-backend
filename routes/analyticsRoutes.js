const express = require("express");
const router = express.Router();

const {
  getMonthlyAttendance,
  getTopWorkers,
  getOvertimeCost,
  getAbsentAlerts
} = require("../Controllers/analyticsController");

/* ================= ANALYTICS ROUTES ================= */

// GET /api/analytics/monthly-attendance
router.get("/monthly-attendance", getMonthlyAttendance);

// GET /api/analytics/top-workers
router.get("/top-workers", getTopWorkers);

// GET /api/analytics/overtime-cost
router.get("/overtime-cost", getOvertimeCost);

// GET /api/analytics/absent-alert
router.get("/absent-alert", getAbsentAlerts);

module.exports = router;
