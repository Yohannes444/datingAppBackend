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
        transactionType:{
          type: String,
          enum:["deposit","pay"],
          required:true
        },
        transactionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Transaction",
          required: true,
        },

      },
    ],
  },
  { timestamps: true }
);

const DriverWallet = mongoose.model("DriverWallet", driverWalletSchema);
module.exports = DriverWallet;
