const mongoose = require("mongoose");

const WarehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: {
      address: String,
      lat: Number,
      lng: Number,
    },
    capacity: { type: Number, required: true },
    orders: [
      {
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        status: {
          type: String,
          enum: ["received", "sorted", "processed", "packaged", "shipped"],
          default: "received",
        },
        sortedAt: Date,
        processedAt: Date,
        packagedAt: Date,
        shippedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

const Warehouse = mongoose.model("Warehouse", WarehouseSchema);
module.exports = Warehouse;
