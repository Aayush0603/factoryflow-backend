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

exports.createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new Admin({
      username,
      password,
      role
    });

    await user.save();

    res.json({ message: "User created successfully" });

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