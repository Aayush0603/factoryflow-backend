const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const protectCustomer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return res.status(401).json({ message: "Customer not found" });
    }

    req.user = customer;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = protectCustomer;