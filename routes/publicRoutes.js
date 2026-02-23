const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Inquiry = require("../models/Inquiry");

/* =========================
   GET ALL PUBLIC PRODUCTS
========================= */
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({
      isPublic: true,
      isActive: true,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================
   GET SINGLE PRODUCT
========================= */
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================
   CREATE INQUIRY
========================= */
router.post("/inquiry", async (req, res) => {
  try {
    const { name, email, phone, product, quantity, message } = req.body;

    const newInquiry = await Inquiry.create({
      name,
      email,
      phone,
      product,
      quantity,
      message,
    });

    res.json({
      message: "Inquiry submitted successfully",
      inquiry: newInquiry,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Dealer = require("../models/Dealer");

/* =========================
   DEALER REGISTER
========================= */
router.post("/dealer-register", async (req, res) => {
  try {
    const { companyName, contactPerson, email, mobile, address, gstNumber, password } = req.body;

    const existing = await Dealer.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Dealer already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Dealer.create({
      companyName,
      contactPerson,
      email,
      mobile,
      address,
      gstNumber,
      password: hashedPassword,
      isApproved: false,
    });

    res.json({ message: "Registration successful. Await admin approval." });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================
   DEALER LOGIN
========================= */
router.post("/dealer-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const dealer = await Dealer.findOne({ email });
    if (!dealer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, dealer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!dealer.isApproved) {
      return res.status(403).json({ message: "Dealer not approved yet" });
    }

    const token = jwt.sign(
      { id: dealer._id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      dealer: {
        id: dealer._id,
        companyName: dealer.companyName,
        email: dealer.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;