const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  inquiry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inquiry",
  },
  amount: Number,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: {
    type: String,
    default: "created",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);