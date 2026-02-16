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

router.get("/analytics/material-efficiency", async (req, res) => {
  try {
    const data = await Production.aggregate([
      {
        $group: {
          _id: null,
          totalProduction: { $sum: "$quantityProduced" },
          totalRawMaterial: { $sum: "$rawMaterialUsedKg" }
        }
      }
    ]);

    if (!data.length || data[0].totalRawMaterial === 0) {
      return res.json({
        totalProduction: 0,
        totalRawMaterial: 0,
        efficiencyRatio: 0
      });
    }

    const totalProduction = data[0].totalProduction;
    const totalRawMaterial = data[0].totalRawMaterial;

    const efficiencyRatio =
      (totalProduction / totalRawMaterial).toFixed(2);

    res.json({
      totalProduction,
      totalRawMaterial,
      efficiencyRatio
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/analytics/product-efficiency", async (req, res) => {
  try {
    const data = await Production.aggregate([
      {
        $group: {
          _id: "$productId",
          totalProduction: { $sum: "$quantityProduced" },
          totalRawMaterial: { $sum: "$rawMaterialUsedKg" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          productName: "$product.name",
          efficiency: {
            $round: [
              { $divide: ["$totalProduction", "$totalRawMaterial"] },
              2
            ]
          }
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/analytics/machine-efficiency-ratio", async (req, res) => {
  try {
    const data = await Production.aggregate([
      {
        $group: {
          _id: "$machineId",
          totalProduction: { $sum: "$quantityProduced" },
          totalRawMaterial: { $sum: "$rawMaterialUsedKg" }
        }
      },
      {
        $lookup: {
          from: "machines",
          localField: "_id",
          foreignField: "_id",
          as: "machine"
        }
      },
      { $unwind: "$machine" },
      {
        $project: {
          machineName: "$machine.name",
          efficiency: {
            $round: [
              { $divide: ["$totalProduction", "$totalRawMaterial"] },
              2
            ]
          }
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/analytics/waste-percentage", async (req, res) => {
  try {
    const data = await Production.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $addFields: {
          expectedOutput: {
            $multiply: ["$product.standardOutputPerHour", "$workingHours"]
          }
        }
      },
      {
        $project: {
          waste: { $subtract: ["$expectedOutput", "$quantityProduced"] },
          wastePercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ["$expectedOutput", "$quantityProduced"] },
                      "$expectedOutput"
                    ]
                  },
                  100
                ]
              },
              2
            ]
          }
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/analytics/anomalies", async (req, res) => {
  try {
    const productions = await Production.find();

    const anomalies = productions.filter(
      (p) => p.efficiency < 60
    );

    res.json({
      anomalyCount: anomalies.length,
      anomalies
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/analytics/spc-efficiency", async (req, res) => {
  try {
    const productions = await Production.find().sort({ productionDate: 1 });

    const efficiencies = productions.map(p => p.efficiency);

    if (efficiencies.length === 0) {
      return res.json([]);
    }

    const mean =
      efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;

    const variance =
      efficiencies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      efficiencies.length;

    const stdDev = Math.sqrt(variance);

    const UCL = mean + 3 * stdDev;
    const LCL = mean - 3 * stdDev;

    const chartData = productions.map(p => ({
      date: p.productionDate,
      efficiency: p.efficiency,
      mean,
      UCL,
      LCL
    }));

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;