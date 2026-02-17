const mongoose = require("mongoose");

const productionTargetSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  targetQuantity: {
    type: Number,
    required: true
  },
  targetDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ["Daily", "Monthly"],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("ProductionTarget", productionTargetSchema);