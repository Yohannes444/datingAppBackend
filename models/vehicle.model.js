const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, required: true },
    capacity: { type: Number, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    availability: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);d
module.exports = Vehicle;
