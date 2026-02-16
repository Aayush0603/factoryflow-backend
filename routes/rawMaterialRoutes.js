const express = require("express");
const router = express.Router();
const RawMaterial = require("../models/RawMaterial");


// Get all raw materials
router.get("/", async (req, res) => {
  try {
    const materials = await RawMaterial.find();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Add raw material
router.post("/", async (req, res) => {
  try {
    const material = new RawMaterial(req.body);
    await material.save();
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Update stock manually
router.put("/:id", async (req, res) => {
  try {
    const updated = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;