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

module.exports = router;