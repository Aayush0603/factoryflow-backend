const express = require("express");
const router = express.Router();
const Production = require("../models/Production");
const Product = require("../models/Product");

// Create Production Entry
router.post("/", async (req, res) => {
  try {
    const {
      productId,
      machineId,
      workers,
      quantityProduced,
      rawMaterialUsedKg,
      workingHours,
      shift,
      productionDate,
    } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const expectedOutput =
      product.standardOutputPerHour * workingHours;

    const efficiency =
      (quantityProduced / expectedOutput) * 100;

    const production = new Production({
      productId,
      machineId,
      workers,
      quantityProduced,
      rawMaterialUsedKg,
      workingHours,
      shift,
      productionDate,
      efficiency,
    });

    await production.save();

    res.status(201).json(production);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Production Entries
router.get("/", async (req, res) => {
  const productions = await Production.find()
    .populate("productId")
    .populate("machineId")
    .populate("workers");

  res.json(productions);
});

router.get("/summary/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const productions = await Production.find({
      productionDate: { $gte: today },
    });

    const totalProduction = productions.reduce(
      (sum, p) => sum + p.quantityProduced,
      0
    );

    const totalRawMaterial = productions.reduce(
      (sum, p) => sum + p.rawMaterialUsedKg,
      0
    );

    const avgEfficiency =
      productions.length > 0
        ? productions.reduce((sum, p) => sum + p.efficiency, 0) /
          productions.length
        : 0;

    res.json({
      totalProduction,
      totalRawMaterial,
      avgEfficiency: avgEfficiency.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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