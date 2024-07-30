const Order = require("../models/order.model");
const Vehicle = require("../models/vehicle.model");

// Function to calculate distance using Haversine formula
function calculateDistanceInKm(pickupLocation, deliveryLocation) {
  const toRad = (value) => (value * Math.PI) / 180;

  const lat1 = toRad(pickupLocation.latitude);
  const lon1 = toRad(pickupLocation.longitude);
  const lat2 = toRad(deliveryLocation.latitude);
  const lon2 = toRad(deliveryLocation.longitude);

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
}

// Calculate delivery cost based on distance, package size, and delivery speed
function calculateDeliveryCost(distance, packageSize, deliverySpeed) {
  let baseCost = 72; // Base cost, can be adjusted based on your pricing strategy
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


exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("customer driver vehicle");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("customer driver vehicle");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "customer driver vehicle"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("customer driver vehicle");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.placeOrder = async (req, res) => {
  try {
    const {
      packageDetails,
      pickupLocation,
      deliveryLocation,
      deliverySpeed,
      vehicleId,
    } = req.body;
    const customer = req.user.id; // Assuming user ID is in req.user.id

    // Calculate distance and cost here...

    const order = new Order({
      customer,
      vehicle: vehicleId,
      packageDetails,
      destination: {
        address: deliveryLocation.address,
        lat: deliveryLocation.latitude,
        lng: deliveryLocation.longitude,
      },
      deliverySpeed,
      cost: calculatedCost,
      tracking: {
        currentLocation: {
          lat: pickupLocation.latitude,
          lng: pickupLocation.longitude,
        },
        history: [
          {
            location: {
              lat: pickupLocation.latitude,
              lng: pickupLocation.longitude,
            },
            timestamp: new Date(),
          },
        ],
      },
      createdBy: customer, // Set createdBy field
      lastUpdatedBy: customer, // Set lastUpdatedBy field
    });

    await order.save();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(400).json({ error: "Error creating order", details: error.message });
  }
};
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const validStatuses = ['in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    order.lastUpdatedBy = req.user.id; // Set lastUpdatedBy field
    await order.save();

    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(400).json({ error: 'Error updating order status', details: error.message });
  }
};

exports.acceptOrder = async (req, res) => {
  try {
    const driver = req.user.id;
    const { orderId, vehicleId } = req.body;
    const vehicle = await Vehicle.findOne({ _id: vehicleId, driver });

    if (!vehicle) {
      return res.status(400).json({ error: 'Vehicle not found or not available' });
    }

    const order = await Order.findById(orderId);

    if (!order || order.status !== 'pending') {
      return res.status(400).json({ error: 'Order not found or already accepted' });
    }

    order.driver = driver;
    order.vehicle = vehicleId;
    order.status = 'accepted';
    order.lastUpdatedBy = driver; // Set lastUpdatedBy field
    await order.save();

    res.status(200).json({ message: 'Order accepted', order });
  } catch (error) {
    res.status(400).json({ error: 'Error accepting order', details: error.message });
  }
};
exports.updateDriver = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const driverId = req.user.id; // Assuming user ID is in req.user.id

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.driver = driverId;
    order.lastUpdatedBy = driverId; // Set lastUpdatedBy field
    await order.save();

    res.status(200).json({ message: 'Driver updated', order });
  } catch (error) {
    res.status(400).json({ error: 'Error updating driver', details: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const vehicleId = req.body.vehicleId;
    const driverId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.vehicle = vehicleId;
    order.lastUpdatedBy = driverId; // Set lastUpdatedBy field
    await order.save();

    res.status(200).json({ message: 'Vehicle updated', order });
  } catch (error) {
    res.status(400).json({ error: 'Error updating vehicle', details: error.message });
  }
};

exports.updateDeliverySpeed = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliverySpeed } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { deliverySpeed, lastUpdatedBy: req.user.id }, // Set lastUpdatedBy field
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { tracking } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { tracking, lastUpdatedBy: req.user.id }, // Set lastUpdatedBy field
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

