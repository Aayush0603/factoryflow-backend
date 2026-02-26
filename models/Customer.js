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
      required: false // ✅ important for Google users
    },

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