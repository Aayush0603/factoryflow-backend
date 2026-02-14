const express = require("express");
const router = express.Router();
const Worker = require("../models/Worker");
const Attendance = require("../models/Attendance");

// GET SALARY BY MONTH
router.get("/:month", async (req, res) => {
  try {
    const { month } = req.params; // format: 2026-02

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Get all workers
    const workers = await Worker.find();

    const salaryData = [];

    for (const worker of workers) {

      // Get attendance records for this month
      const records = await Attendance.find({
        workerId: worker._id,
        checkInTime: { $gte: startDate, $lt: endDate }
      });

      const daysWorked = records.length;

      let normalHours = 0;
      let overtimeHours = 0;

      records.forEach(record => {
        const hours = parseFloat(record.workHours || 0);

        if (hours > 8) {
          normalHours += 8;
          overtimeHours += hours - 8;
        } else {
          normalHours += hours;
        }
      });

      let baseSalary = 0;
      let overtimePay = 0;

      if (worker.salaryType === "monthly") {
        baseSalary = worker.salaryAmount;

        const hourlyRate = worker.salaryAmount / 176; // 22 days × 8 hours
        const overtimeRate = hourlyRate * 1.5;

        overtimePay = overtimeHours * overtimeRate;

      } else if (worker.salaryType === "daily") {
        baseSalary = daysWorked * worker.salaryAmount;

        const hourlyRate = worker.salaryAmount / 8;
        const overtimeRate = hourlyRate * 1.5;

        overtimePay = overtimeHours * overtimeRate;
      }

      const finalSalary = baseSalary + overtimePay;

      salaryData.push({
        name: worker.name,
        role: worker.role,
        daysWorked,
        normalHours,
        overtimeHours,
        baseSalary: Math.round(baseSalary),
        overtimePay: Math.round(overtimePay),
        finalSalary: Math.round(finalSalary)
      });
    }

    res.json(salaryData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Salary calculation failed" });
  }
});

module.exports = router;