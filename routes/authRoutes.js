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

module.exports = router;