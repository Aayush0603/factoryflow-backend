const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true
  },

  date: String,

  // 👇 DISPLAY TIMES
  checkIn: String,
  checkOut: String,

  // 👇 REAL TIMES (IMPORTANT)
  checkInTime: Date,
  checkOutTime: Date,

  workHours: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
