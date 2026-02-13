const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: {
    type: String,
    enum: ["admin", "supervisor"],
    default: "admin"
  }
});

module.exports = mongoose.model("Admin", adminSchema);