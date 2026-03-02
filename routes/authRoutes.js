const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getAllUsers,
  deleteUser
} = require("../controllers/authController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);

// 🔐 Admin Only
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.delete("/users/:id", protect, authorizeRoles("admin"), deleteUser);


router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, role: "admin" });
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl =
      `${process.env.ERP_FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "ERP Password Reset",
      `Reset your password:\n\n${resetUrl}`
    );

    res.json({ message: "Reset email sent" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});
module.exports = router;