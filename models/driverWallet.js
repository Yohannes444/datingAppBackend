const mongoose = require("mongoose");

const driverWalletSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      required: false,
    },
    transactions: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },

      },
    ],
  },
  { timestamps: true }
);

const DriverWallet = mongoose.model("DriverWallet", driverWalletSchema);
module.exports = DriverWallet;
