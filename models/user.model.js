const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "driver", "company_admin","developer","super_admin","agent", "warhouse_manager"],
      required: true,
    },
    profile: {
      address: String,
      preferences: Object
    },
    availability : {
      type: Boolean,
      default: false,
      required: false,
    },
    active: {
      type: Boolean,
      default: true,
      required: false,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
