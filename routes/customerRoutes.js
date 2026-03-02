const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");

const sendEmail = require("../utils/sendEmail");
const Customer = require("../models/Customer");
const customerAuthMiddleware = require("../middleware/customerAuthMiddleware");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* =========================
   GOOGLE LOGIN
========================= */
router.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    let customer = await Customer.findOne({ email });

    if (!customer) {
      customer = await Customer.create({
        name,
        email,
        googleId: sub,
        avatar: picture,
      });
    }

    const jwtToken = jwt.sign(
      { id: customer._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token: jwtToken, customer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Google login failed" });
  }
});

/* =========================
   FORGOT PASSWORD
========================= */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    customer.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    customer.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await customer.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      customer.email,
      "Password Reset",
      `Click here to reset your password:\n\n${resetUrl}`
    );

    res.json({ message: "Reset email sent" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================
   RESET PASSWORD
========================= */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const customer = await Customer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!customer) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    customer.password = await bcrypt.hash(req.body.password, 10);
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpire = undefined;

    await customer.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================
   CHANGE PASSWORD (LOGGED IN)
========================= */
router.put("/change-password", customerAuthMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!customer.password) {
      return res.status(400).json({
        message: "Password change not allowed for Google users"
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      customer.password
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;