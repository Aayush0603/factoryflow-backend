const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const optionalCustomerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(); // No token → continue as guest
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    );

    const customer = await Customer.findById(decoded.id).select("-password");

    if (customer) {
      req.user = customer; // Attach logged-in user
    }

    next();
  } catch (error) {
    next(); // Even if token invalid → continue as guest
  }
};

module.exports = optionalCustomerAuth;