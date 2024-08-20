const mongoose = require("mongoose");

const WarehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    warhouse_manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      address: String,
      lat: Number,
      lng: Number,
    },
    capacity: { type: Number, required: true },
    orders: [
{      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required:false
}    ],
  },
  { timestamps: true }
);

const Warehouse = mongoose.model("Warehouse", WarehouseSchema);
module.exports = Warehouse;
