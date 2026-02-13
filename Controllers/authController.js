const Admin = require("../models/Admin");

/* ================= LOGIN ================= */
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });

    if (!admin || admin.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ================= CREATE ADMIN ================= */
exports.createAdmin = async (req, res) => {
  try {
    await Admin.deleteMany({});

    const newAdmin = new Admin({
      username: "admin",
      password: "admin123",
      role: "admin"
    });

    await newAdmin.save();

    res.json({ message: "Admin created successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ================= CREATE SUPERVISOR ================= */
exports.createSupervisor = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const supervisor = new Admin({
      username,
      password,
      role: "supervisor"
    });

    await supervisor.save();

    res.json({ message: "Supervisor created successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ================= GET ALL USERS ================= */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Admin.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ================= DELETE USER ================= */
exports.deleteUser = async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};