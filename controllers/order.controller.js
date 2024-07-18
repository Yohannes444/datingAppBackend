const Order = require("../models/order.model");
const Vehicle = require("../models/vehicle.model");

// Function to calculate distance between two points (example)
function calculateDistance(pickupLocation, deliveryLocation) {
  // Implement your distance calculation logic here (using an API or custom function)
  // For example, using a hypothetical distance calculation function:
  const distanceInKm = calculateDistanceInKm(pickupLocation, deliveryLocation);
  return distanceInKm;
}

// Function to calculate delivery cost based on distance, package size, and speed
function calculateDeliveryCost(distance, packageSize, deliverySpeed) {
  let baseCost = 5; // Base cost, can be adjusted based on your pricing strategy
  let sizeFactor = 1; // Adjust based on package size
  let speedFactor = 1; // Adjust based on delivery speed

  // Example factors based on size and speed
  if (packageSize === "medium") {
    sizeFactor = 1.5;
  } else if (packageSize === "large") {
    sizeFactor = 2;
  }

  if (deliverySpeed === "express") {
    speedFactor = 1.5;
  }

  // Example formula for calculating cost
  const cost = baseCost * distance * sizeFactor * speedFactor;
  return cost;
}

exports.placeOrder = async (req, res) => {
  try {
    const { packageDetails, pickupLocation, deliveryLocation, deliverySpeed } =
      req.body;
    const customer = req.user.id;

    // Calculate distance between pickup and delivery locations
    const distance = calculateDistance(pickupLocation, deliveryLocation);

    // Example: Fetching vehicle details from the database (assuming vehicleId is passed in req.body)
    // Replace this with your actual logic to fetch and validate vehicle details
    const vehicleId = req.body.vehicleId;
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Example: Fetching package size from packageDetails (adjust as per your schema)
    const packageSize = packageDetails.size; // Adjust based on your packageDetails schema

    // Calculate delivery cost based on distance, package size, and delivery speed
    const calculatedCost = calculateDeliveryCost(
      distance,
      packageSize,
      deliverySpeed
    );

    // Create new order object
    const order = new Order({
      customer,
      packageDetails,
      pickupLocation,
      deliveryLocation,
      distance,
      deliverySpeed,
      cost: calculatedCost,
      vehicle: vehicle._id, // Assuming you store vehicle reference in order
    });

    // Save order to database
    await order.save();

    // Respond with success message and order details
    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    // Handle errors
    res
      .status(400)
      .json({ error: "Error creating order", details: error.message });
  }
};

exports.getOrdersByCustomer = async (req, res) => {
  try {
    const customer = req.user.id;
    const orders = await Order.find({ customer }).populate(
      "driver vehicle payment"
    );
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error fetching orders", details: error.message });
  }
};
exports.getOrdersForDriver = async (req, res) => {
  try {
    const driver = req.user.id;
    const orders = await Order.find({ driver }).populate(
      "customer",
      "username"
    );
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error fetching orders", details: error.message });
  }
};
exports.acceptOrder = async (req, res) => {
  try {
    const driver = req.user.id;
    const { orderId, vehicleId } = req.body;
    const vehicle = await Vehicle.findOne({ _id: vehicleId, driver });

    if (!vehicle) {
      return res
        .status(400)
        .json({ error: "Vehicle not found or not available" });
    }

    const order = await Order.findById(orderId);

    if (!order || order.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Order not found or already accepted" });
    }

    order.driver = driver;
    order.vehicle = vehicleId;
    order.status = "accepted";
    await order.save();

    res.status(200).json({ message: "Order accepted", order });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error accepting order", details: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const validStatuses = ["in-progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error updating order status", details: error.message });
  }
};

exports.declineOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const driverId = req.user.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.driver && order.driver.toString() !== driverId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to decline this order" });
    }

    order.driver = null;
    order.status = "declined";
    await order.save();

    res.status(200).json({ message: "Order declined successfully", order });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error declining order", details: error.message });
  }
};
