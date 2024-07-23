const Vehicle = require("../models/vehicle.model");

// Register a new vehicle
exports.registerVehicle = async (req, res) => {
  try {
    const { type, capacity, registrationNumber } = req.body;
    const driver = req.user.id;

    const vehicle = new Vehicle({ driver, type, capacity, registrationNumber });
    await vehicle.save();

    res
      .status(201)
      .json({ message: "Vehicle registered successfully", vehicle });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error registering vehicle", details: error.message });
  }
};
// Get vehicles owned by the authenticated driver
exports.getDriverVehicles = async (req, res) => {
  try {
    const driver = req.user.id;
    const vehicles = await Vehicle.find({ driver });

    res.status(200).json(vehicles);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error fetching vehicles", details: error.message });
  }
};
// Update availability of a vehicle owned by the authenticated driver
exports.updateVehicleAvailability = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { availability } = req.body;
    const driver = req.user.id;

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: vehicleId, driver },
      { availability },
      { new: true }
    );

    if (!vehicle) {
      return res
        .status(404)
        .json({ error: "Vehicle not found or not owned by the driver" });
    }

    res.status(200).json({ message: "Vehicle availability updated", vehicle });
  } catch (error) {
    res.status(400).json({
      error: "Error updating vehicle availability",
      details: error.message,
    });
  }
};
// Get all available vehicles
exports.getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ availability: true }).populate(
      "driver",
      "name"
    );

    res.status(200).json(vehicles);
  } catch (error) {
    res.status(400).json({
      error: "Error fetching available vehicles",
      details: error.message,
    });
  }
};
// Get vehicle details by ID
exports.getVehicleById = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await Vehicle.findById(vehicleId).populate(
      "driver",
      "name"
    );

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    res.status(400).json({
      error: "Error fetching vehicle details",
      details: error.message,
    });
  }
};
// Update vehicle details
exports.updateVehicleDetails = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { type, capacity, registrationNumber } = req.body;
    const driver = req.user.id;

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: vehicleId, driver },
      { type, capacity, registrationNumber },
      { new: true }
    );

    if (!vehicle) {
      return res
        .status(404)
        .json({ error: "Vehicle not found or not owned by the driver" });
    }

    res.status(200).json({ message: "Vehicle details updated", vehicle });
  } catch (error) {
    res.status(400).json({
      error: "Error updating vehicle details",
      details: error.message,
    });
  }
};
// Delete a vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const driver = req.user.id;

    const vehicle = await Vehicle.findOneAndDelete({ _id: vehicleId, driver });

    if (!vehicle) {
      return res
        .status(404)
        .json({ error: "Vehicle not found or not owned by the driver" });
    }

    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error deleting vehicle", details: error.message });
  }
};
// Search vehicles
exports.searchVehicles = async (req, res) => {
  try {
    const { keyword } = req.query;
    const vehicles = await Vehicle.find({
      $or: [
        { type: { $regex: keyword, $options: "i" } },
        { registrationNumber: { $regex: keyword, $options: "i" } },
      ],
    }).populate("driver", "name");

    res.status(200).json(vehicles);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error searching vehicles", details: error.message });
  }
};
// Assign a vehicle to a driver
exports.assignVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { driverId } = req.body;

    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { driver: driverId },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.status(200).json({ message: "Vehicle assigned successfully", vehicle });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error assigning vehicle", details: error.message });
  }
};
// Remove driver assignment from a vehicle
exports.removeDriverAssignment = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { driver: null },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res
      .status(200)
      .json({ message: "Driver assignment removed successfully", vehicle });
  } catch (error) {
    res.status(400).json({
      error: "Error removing driver assignment",
      details: error.message,
    });
  }
};
// Get vehicles by type
exports.getVehiclesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const vehicles = await Vehicle.find({ type }).populate("driver", "name");

    res.status(200).json(vehicles);
  } catch (error) {
    res.status(400).json({
      error: "Error fetching vehicles by type",
      details: error.message,
    });
  }
};
