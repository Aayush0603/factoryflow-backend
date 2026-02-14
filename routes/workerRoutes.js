const express = require("express");
const router = express.Router();
const Worker = require("../models/Worker");
const Attendance = require("../models/Attendance");

// 🔥 GET WORKER PROFILE
router.get("/profile/:id", async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const attendance = await Attendance.find({
      workerId: req.params.id
    }).sort({ date: -1 });

    const totalDaysWorked = attendance.length;

    const totalHoursWorked = attendance.reduce(
      (sum, record) => sum + (Number(record.workHours) || 0),
      0
    );

    res.json({
      worker,
      totalDaysWorked,
      totalHoursWorked,
      attendance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

module.exports = router;