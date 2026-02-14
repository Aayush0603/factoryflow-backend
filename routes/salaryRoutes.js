const express = require("express");
const router = express.Router();

// Example temporary logic (replace with real salary logic)
router.get("/:month", async (req, res) => {
  try {
    const month = req.params.month;

    // You will replace this with real DB logic
    res.json([
      {
        name: "Sample Worker",
        role: "Helper",
        daysWorked: 22,
        normalHours: 176,
        overtimeHours: 12,
        baseSalary: 22000,
        overtimePay: 1800,
        finalSalary: 23800
      }
    ]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Salary calculation failed" });
  }
});

module.exports = router;