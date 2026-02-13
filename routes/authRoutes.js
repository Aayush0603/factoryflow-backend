const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  createAdmin,
  createSupervisor,
  getAllUsers,
  deleteUser
} = require("../Controllers/authController");

router.post("/login", loginAdmin);
router.get("/create-admin", createAdmin);
router.post("/create-supervisor", createSupervisor);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

module.exports = router;