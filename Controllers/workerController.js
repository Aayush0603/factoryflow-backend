const Worker = require("../models/Worker");
const Attendance = require("../models/Attendance");

exports.addWorker = async (req, res) => {
  const worker = new Worker(req.body);
  await worker.save();
  res.json(worker);
};

exports.getWorkers = async (req, res) => {
  res.json(await Worker.find());
};

exports.updateWorker = async (req, res) => {
  const updated = await Worker.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

exports.deleteWorker = async (req, res) => {
  await Attendance.deleteMany({ workerId: req.params.id });
  await Worker.findByIdAndDelete(req.params.id);
  res.json({ message: "Worker deleted" });
};