const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true
  },
  rawMaterialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RawMaterial",
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Pending"],
    default: "Pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Purchase", purchaseSchema);