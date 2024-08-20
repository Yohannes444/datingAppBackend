const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional field
    },
    type: { 
      type: String, 
      required: true 
    },
    capacity: { 
      type: Number, 
      required: true 
    },
    registrationNumber: { 
      type: String, 
      required: true, 
      unique: true 
    },
    availability: { 
      type: Boolean, 
      default: true 
    },
    driverLicense: { 
      type: String, 
      required: false // Optional field
    },
    vehicleLibrary: { 
      type: String, 
      required: false // Optional field
    },
    vehicleImage: { 
      type: String, 
      required: false // Optional field
    },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
module.exports = Vehicle;
