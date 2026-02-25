const Worker = require("../models/Worker");
const Attendance = require("../models/Attendance");

exports.getDashboard = async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  res.json({
    totalWorkers: await Worker.countDocuments(),
    presentToday: await Attendance.countDocuments({ date: today }),
    completedShift: await Attendance.countDocuments({
      date: today,
      checkOutTime: { $ne: null }
    })
  });
};
