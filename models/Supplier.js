const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },

  supplierName: {
    type: String,
    required: true
  },

  mobile: {
    type: String,
    required: true
  },

  email: {
    type: String
  },
  
  address: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("Supplier", supplierSchema);