const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const Customer = require("../models/Customer");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* =========================
   CUSTOMER REGISTER
========================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Customer already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: customer._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, customer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================
   CUSTOMER LOGIN
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: customer._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, customer });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================
   GOOGLE LOGIN
========================= */
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
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
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Google login failed" });
  }
});

const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail"); // create this if not exists

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

    customer.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await customer.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      customer.email,
      "Password Reset",
      `Click here to reset password: ${resetUrl}`
    );

    res.json({ message: "Reset email sent" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

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

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    customer.password = hashedPassword;
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpire = undefined;

    await customer.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;