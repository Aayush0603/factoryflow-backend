const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  // Existing fields (DO NOT REMOVE)
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  standardOutputPerHour: {
    type: Number,
    required: true,
  },

  // 🔹 New fields for Customer Website
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  publicPrice: {
    type: Number,
  },
  dealerPrice: {
    type: Number,
  },
  availableStock: {
    type: Number,
    default: 0,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);