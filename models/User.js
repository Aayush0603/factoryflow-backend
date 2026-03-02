const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["admin", "customer", "dealer", "dealer_pending"],
      default: "customer"
    },

    // ✅ ADD THESE
    resetPasswordToken: {
      type: String
    },

    resetPasswordExpire: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);