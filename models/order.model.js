const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    packageDetails: {
      size: String,
      weight: Number,
      content: String,
    },
    pickupLocation: {
      address: String,
      lat: Number,
      lng: Number,
    },
    destination: {
      address: String,
      lat: Number,
      lng: Number,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "in-transit", "completed", "declined"],
      default: "pending",
    },
    cost: Number,
    deliverySpeed: { type: String, enum: ["standard", "express"] },
    tracking: {
      currentLocation: {
        lat: Number,
        lng: Number,
      },
      history: [
        {
          location: {
            lat: Number,
            lng: Number,
          },
          timestamp: Date,
        },
      ],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
