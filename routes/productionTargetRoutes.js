const express = require("express");
const router = express.Router();
const ProductionTarget = require("../models/ProductionTarget");
const Production = require("../models/Production");

// Create Target
router.post("/", async (req, res) => {
  try {
    const target = new ProductionTarget(req.body);
    await target.save();
    res.status(201).json(target);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Targets with Achievement %
router.get("/achievement", async (req, res) => {
  try {
    const targets = await ProductionTarget.find().populate("productId");

    const result = [];

    for (let t of targets) {
      let startDate = new Date(t.targetDate);
      let endDate = new Date(t.targetDate);

      if (t.type === "Daily") {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      }

      const productions = await Production.find({
        productId: t.productId._id,
        productionDate: { $gte: startDate, $lte: endDate }
      });

      const actual = productions.reduce(
        (sum, p) => sum + p.quantityProduced,
        0
      );

      const achievement =
        t.targetQuantity > 0
          ? ((actual / t.targetQuantity) * 100).toFixed(2)
          : 0;

      result.push({
        productName: t.productId.name,
        type: t.type,
        targetQuantity: t.targetQuantity,
        actual,
        achievement
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;