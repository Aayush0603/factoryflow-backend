const Worker = require("../models/Worker");
const Attendance = require("../models/Attendance");

/* ================= MONTHLY ATTENDANCE ================= */
exports.getMonthlyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find();
    const monthly = {};

    records.forEach(r => {
      if (!r.date) return;

      const month = r.date.slice(0, 7); // YYYY-MM
      monthly[month] = (monthly[month] || 0) + 1;
    });

    res.json(monthly);
  } catch (error) {
    console.error("Monthly Attendance Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ================= TOP WORKERS ================= */
exports.getTopWorkers = async (req, res) => {
  try {
    const workers = await Worker.find();
    const result = [];

    for (let w of workers) {
      const records = await Attendance.find({ workerId: w._id });

      const totalHours = records.reduce(
        (sum, r) => sum + (parseFloat(r.workHours) || 0),
        0
      );

      result.push({
        name: w.name,
        totalHours: totalHours.toFixed(2)
      });
    }

    result.sort((a, b) => b.totalHours - a.totalHours);

    res.json(result.slice(0, 5));
  } catch (error) {
    console.error("Top Workers Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ================= OVERTIME COST ================= */
exports.getOvertimeCost = async (req, res) => {
  try {
    const workers = await Worker.find();
    let total = 0;

    for (let w of workers) {
      const records = await Attendance.find({ workerId: w._id });

      const totalHours = records.reduce(
        (sum, r) => sum + (parseFloat(r.workHours) || 0),
        0
      );

      const expectedHours = records.length * 8;
      const overtime = Math.max(0, totalHours - expectedHours);

      if (w.salaryAmount) {
        total += overtime * (w.salaryAmount / 8);
      }
    }

    res.json({ totalOTPay: total.toFixed(2) });
  } catch (error) {
    console.error("Overtime Cost Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ================= ABSENT ALERTS ================= */
exports.getAbsentAlerts = async (req, res) => {
  try {
    const workers = await Worker.find();
    const alerts = [];

    // Example: Expected 26 working days per month
    const expectedWorkingDays = 26;

    for (let w of workers) {
      const records = await Attendance.find({ workerId: w._id });

      const workedDays = records.length;

      if (workedDays < expectedWorkingDays) {
        alerts.push({
          name: w.name,
          worked: workedDays,
          expected: expectedWorkingDays
        });
      }
    }

    res.json(alerts);
  } catch (error) {
    console.error("Absent Alert Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};