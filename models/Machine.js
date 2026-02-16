const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  capacityPerHour: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Maintenance"],
    default: "Active",
  },
});

module.exports = mongoose.model("Machine", machineSchema);