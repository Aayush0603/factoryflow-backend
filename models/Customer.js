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

    // 🔐 Password only for normal login users
    password: {
      type: String,
      required: function () {
        return !this.googleId; 
      }
    },

    // 🔵 Google Login Support
    googleId: {
      type: String
    },

    avatar: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);