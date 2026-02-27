const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
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

    phone: {
      type: String
    },

    password: {
      type: String,
      required: false // ✅ Important for Google users
    },

    googleId: {
      type: String
    },

    avatar: {
      type: String
    },

    // ✅ Forgot Password Fields
    resetPasswordToken: {
      type: String
    },

    resetPasswordExpire: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);