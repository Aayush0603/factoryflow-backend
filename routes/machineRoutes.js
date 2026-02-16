const express = require("express");
const router = express.Router();
const Machine = require("../models/Machine");

// Create Machine
router.post("/", async (req, res) => {
  try {
    const machine = new Machine(req.body);
    await machine.save();
    res.status(201).json(machine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Machines
router.get("/", async (req, res) => {
  const machines = await Machine.find();
  res.json(machines);
});

// Update Machine Status
router.patch("/:id", async (req, res) => {
  const machine = await Machine.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(machine);
});

router.get("/analytics/machine-efficiency", async (req, res) => {
  try {
    const data = await Production.aggregate([
      {
        $group: {
          _id: "$machineId",
          avgEfficiency: { $avg: "$efficiency" },
        },
      },
      {
        $lookup: {
          from: "machines",
          localField: "_id",
          foreignField: "_id",
          as: "machine",
        },
      },
      { $unwind: "$machine" },
      {
        $project: {
          machineName: "$machine.name",
          avgEfficiency: { $round: ["$avgEfficiency", 2] },
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;