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
});

module.exports = mongoose.model("Production", productionSchema);