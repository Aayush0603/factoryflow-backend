const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");
const RawMaterial = require("../models/RawMaterial");

// Create Purchase
router.post("/", async (req, res) => {
  try {
    const {
      supplierId,
      rawMaterialId,
      quantity,
      pricePerUnit,
      paymentStatus
    } = req.body;

    const totalAmount = quantity * pricePerUnit;

    const purchase = new Purchase({
      supplierId,
      rawMaterialId,
      quantity,
      pricePerUnit,
      totalAmount,
      paymentStatus
    });

    await purchase.save();

    // ✅ AUTO INCREASE RAW MATERIAL STOCK
    await RawMaterial.findByIdAndUpdate(rawMaterialId, {
      $inc: { currentStock: quantity }
    });

    res.status(201).json(purchase);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all purchases
router.get("/", async (req, res) => {
  const purchases = await Purchase.find()
    .populate("supplierId")
    .populate("rawMaterialId");

  res.json(purchases);
});

module.exports = router;