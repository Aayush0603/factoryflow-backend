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

module.exports = router;