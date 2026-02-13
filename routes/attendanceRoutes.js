const express = require("express");
const router = express.Router();
const {
  checkIn,
  checkOut,
  getAttendanceHistory,
  getAttendanceStatus
} = require("../controllers/attendanceController");

router.post("/checkin", checkIn);
router.post("/checkout", checkOut);
router.get("/history", getAttendanceHistory);
router.get("/status/:workerId", getAttendanceStatus);

module.exports = router;