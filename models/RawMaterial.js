const mongoose = require("mongoose");

const rawMaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  unit: {
    type: String,
    default: "kg"
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0
  },
  minimumStock: {
    type: Number,
    default: 0
  },
  costPerUnit: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("RawMaterial", rawMaterialSchema);