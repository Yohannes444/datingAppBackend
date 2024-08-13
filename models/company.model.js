const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
      required: false,
    },
    vehicles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    }],
    orders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    }],
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
