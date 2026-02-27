const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return res.status(401).json({ message: "Customer not found" });
    }

    req.customer = customer;   // ✅ use req.customer (clean separation from ERP user)

    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};