const mongoose = require("mongoose");

const productionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Machine",
    required: true,
  },

  workers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
    },
  ],

  // ✅ NEW FIELD FOR INVENTORY LINK
  rawMaterialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RawMaterial",
    required: true,
  },

  quantityProduced: {
    type: Number,
    required: true,
  },

  rawMaterialUsedKg: {
    type: Number,
    required: true,
  },

  workingHours: {
    type: Number,
    required: true,
  },

  shift: {
    type: String,
    enum: ["Morning", "Evening"],
    required: true,
  },

  productionDate: {
    type: Date,
    default: Date.now,
  },

  efficiency: {
    type: Number,
  },
}, { timestamps: true });

module.exports = mongoose.model("Production", productionSchema);