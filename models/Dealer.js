const mongoose = require("mongoose");

const dealerSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: String,
    address: String,
    gstNumber: String,
    password: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dealer", dealerSchema);