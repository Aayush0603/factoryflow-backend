const express = require("express");
const router = express.Router();

const Worker = require("../models/Worker");
const Attendance = require("../models/Attendance");


/* =====================================================
   🔹 GET ALL WORKERS
===================================================== */
router.get("/", async (req, res) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.json(workers);
  } catch (err) {
    console.error("Error fetching workers:", err);
    res.status(500).json({ message: "Failed to fetch workers" });
  }
});


/* =====================================================
   🔥 IMPORTANT: PROFILE ROUTE (MUST BE BEFORE :id)
===================================================== */
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
    console.error("Error fetching worker profile:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});


/* =====================================================
   🔹 GET SINGLE WORKER (GENERIC - MUST BE AFTER PROFILE)
===================================================== */
router.get("/:id", async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.json(worker);
  } catch (err) {
    console.error("Error fetching worker:", err);
    res.status(500).json({ message: "Failed to fetch worker" });
  }
});


/* =====================================================
   🔹 ADD NEW WORKER
===================================================== */
router.post("/", async (req, res) => {
  try {
    const newWorker = new Worker(req.body);
    const savedWorker = await newWorker.save();
    res.status(201).json(savedWorker);
  } catch (err) {
    console.error("Error creating worker:", err);
    res.status(500).json({ message: "Failed to create worker" });
  }
});


/* =====================================================
   🔹 UPDATE WORKER
===================================================== */
router.put("/:id", async (req, res) => {
  try {
    const updatedWorker = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedWorker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.json(updatedWorker);
  } catch (err) {
    console.error("Error updating worker:", err);
    res.status(500).json({ message: "Failed to update worker" });
  }
});


/* =====================================================
   🔹 DELETE WORKER
===================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const deletedWorker = await Worker.findByIdAndDelete(req.params.id);

    if (!deletedWorker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // Optional: delete related attendance records
    await Attendance.deleteMany({ workerId: req.params.id });

    res.json({ message: "Worker deleted successfully" });
  } catch (err) {
    console.error("Error deleting worker:", err);
    res.status(500).json({ message: "Failed to delete worker" });
  }
});


module.exports = router;