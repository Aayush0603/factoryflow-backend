const Attendance = require("../models/Attendance");

const getISTTimeString = (date) => {
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getISTDate = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
};

exports.checkIn = async (req, res) => {
  const today = getISTDate();

  if (await Attendance.findOne({ workerId: req.body.workerId, date: today })) {
    return res.json({ message: "Already checked in" });
  }

  const now = new Date();

  const record = new Attendance({
    workerId: req.body.workerId,
    date: today,
    checkInTime: now, // store raw UTC
    checkIn: getISTTimeString(now) // store IST formatted time
  });

  await record.save();
  res.json(record);
};

exports.checkOut = async (req, res) => {
  const today = getISTDate();

  const record = await Attendance.findOne({
    workerId: req.body.workerId,
    date: today
  });

  if (!record || !record.checkInTime)
    return res.status(400).json({ message: "Invalid attendance record" });

  const now = new Date();

  record.checkOutTime = now; // raw UTC
  record.checkOut = getISTTimeString(now); // IST display time

  record.workHours = (
    (now - record.checkInTime) / 3600000
  ).toFixed(2);

  await record.save();
  res.json(record);
};

exports.getAttendanceHistory = async (req, res) => {
  const records = await Attendance.find().populate("workerId");

  res.json(records.map(r => ({
    name: r.workerId?.name || "Unknown",
    date: r.date,
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    workHours: r.workHours
  })));
};

exports.getAttendanceStatus = async (req, res) => {
  const today = getISTDate();

  const record = await Attendance.findOne({
    workerId: req.params.workerId,
    date: today
  });

  if (!record) return res.json({ status: "not_checked_in" });
  if (record.checkInTime && !record.checkOutTime)
    return res.json({ status: "checked_in" });

  return res.json({ status: "completed" });
};