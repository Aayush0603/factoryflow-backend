const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  role: String,
  salaryType: { type: String, enum: ["daily", "monthly"] },
  salaryAmount: Number
});

module.exports = mongoose.model("Worker", workerSchema);
