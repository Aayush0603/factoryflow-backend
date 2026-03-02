const express = require("express");
const router = express.Router();

const Otp = require("../models/Otp");
const sendOTP = require("../utils/sendOTP");
const Product = require("../models/Product");
const Inquiry = require("../models/Inquiry");

const customerAuthMiddleware = require("../middleware/customerAuthMiddleware");

const optionalCustomerAuth = require("../middleware/optionalCustomerAuth");

const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
router.post("/inquiry", optionalCustomerAuth, async (req, res) => {
  try {
    const { name, email, phone, product, quantity, message } = req.body;

    const newInquiry = await Inquiry.create({
      name,
      email,
      phone,
      product,
      quantity,
      message,
      customer: req.user ? req.user._id : null
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

/* =========================
   GET INQUIRIES BY EMAIL
========================= */
const customerAuth = require("../middleware/customerAuthMiddleware");

router.get("/my-inquiries", customerAuthMiddleware, async (req, res) => {
  try {
    const inquiries = await Inquiry.find({
      customer: req.user._id
    })
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.json(inquiries);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
/* =========================
   GET DEALER INQUIRIES
========================= */
router.get("/dealer-inquiries/:dealerId", async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ dealer: req.params.dealerId })
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/send-otp", async (req, res) => {
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete previous OTP for that email
    await Otp.deleteMany({ email });

    // Save new OTP
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send email
    await sendOTP(email, otp);

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("OTP Send Error:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const email = req.body.email;
    const otp = String(req.body.otp).trim();

    const record = await Otp.findOne({ email });

    if (!record) {
      return res.status(400).json({ message: "No OTP found" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await Otp.deleteMany({ email });

    const inquiries = await Inquiry.find({ email })
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.json({ inquiries });

  } catch (error) {
    console.error("OTP Verify Error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
});

router.post("/create-order", async (req, res) => {
  try {
    const { inquiryId, amount } = req.body;

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      inquiry: inquiryId,
      amount,
      razorpayOrderId: order.id,
      status: "created",
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating order" });
  }
});

router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        status: "paid",
      }
    );

    res.json({ message: "Payment verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Payment verification failed" });
  }
});

// =========================
// ADMIN - GET ALL INQUIRIES
// =========================
router.get("/admin/inquiries", async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.json(inquiries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;