const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  createAdmin,
  createUser,   // ✅ change here
  getAllUsers,
  deleteUser
} = require("../Controllers/authController");
router.post("/login", loginAdmin);
router.get("/create-admin", createAdmin);
router.post("/create-user", createUser);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

module.exports = router;