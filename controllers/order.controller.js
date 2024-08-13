const Order = require("../models/order.model");
const Vehicle = require("../models/vehicle.model");
const { io } = require("../server");
const axios = require ("axios")

const sendSms = async (to, body) => {
  try {
    const smsData = {
      phone: to,
      text: body
    };
    await axios.post(process.env.KG_SMS_API, smsData);
    console.log(`SMS sent to ${to}`);
  } catch (error) {
    console.error(`Error sending SMS: ${error.message}`);
  }
};
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

// Calculate volumetric weight based on dimensions (length, width, height)
function calculateVolumetricWeight(length, width, height) {
  const volumetricFactor = 5000; // Adjust as per your volumetric weight calculation factor
  return (length * width * height) / volumetricFactor;
}

// Calculate delivery cost based on distance, package dimensions, weight, and delivery speed
function calculateDeliveryCost(distance, packageDetails, deliverySpeed) {
  const baseCost = 100; // Base cost
  const costPerKm = 120; // Cost per kilometer
  const weightFactor = packageDetails.weight * 10; // Weight factor, 10 units per kg
  const sizeFactor = packageDetails.volumetricWeight * 5; // Size factor based on volumetric weight
  let speedFactor = 1; // Adjust based on delivery speed

  if (deliverySpeed === "express") {
    speedFactor = 1.5;
  }

  // Calculate the total cost
  const distanceCost = distance * costPerKm;
  const totalCost =
    baseCost + distanceCost + weightFactor * speedFactor + sizeFactor;
  return {
    totalCost,
    baseCost,
    costPerKm,
    distanceCost,
    distance,
    packageWeight: packageDetails.weight,
    weightFactor,
    speedFactor,
    sizeFactor,
  };
}

exports.placeOrder = async (req, res) => {
  try {
    const { packageDetails, pickupLocation, deliveryLocation, deliverySpeed } =
      req.body;
    const vehicleId = req.params.vehicleId; // Get vehicleId from URL parameters

    if (!vehicleId) {
      return res.status(400).json({ error: "Vehicle ID is required" });
    }

    // Calculate distance between pickup and delivery locations
    const distanceInKm = calculateDistanceInKm(
      pickupLocation,
      deliveryLocation
    );

    // Calculate volumetric weight based on package dimensions
    const volumetricWeight = calculateVolumetricWeight(
      packageDetails.length,
      packageDetails.width,
      packageDetails.height
    );

    // Calculate delivery cost based on distance, package weight, dimensions, and delivery speed
    const {
      totalCost,
      baseCost,
      costPerKm,
      distanceCost,
      distance,
      packageWeight,
      weightFactor,
      speedFactor,
      sizeFactor,
    } = calculateDeliveryCost(
      distanceInKm,
      { ...packageDetails, volumetricWeight },
      deliverySpeed
    );

    // Log detailed info to the console
    // console.log("Detailed Info:", {
    //   packageWeight,
    //   deliverySpeed,
    //   baseCost,
    //   costPerKm,
    //   distanceCost,
    //   distance,
    //   weightFactor,
    //   speedFactor,
    //   distanceInKm,
    //   totalCost,
    //   sizeFactor,
    //   volumetricWeight,
    // });
    const customer = "66b4817f3903106d1bfda03c"; // Assuming user ID is in req.user.id
    // Create new order object
    const order = new Order({
      customer,
      vehicle: vehicleId,
      packageDetails,
      pickupLocation: {
        address: pickupLocation.address, // Adjust if you have a different address field
        lat: pickupLocation.latitude,
        lng: pickupLocation.longitude,
      },
      destination: {
        address: deliveryLocation.address, // Adjust if you have a different address field
        lat: deliveryLocation.latitude,
        lng: deliveryLocation.longitude,
      },
      distanceInKm,
      deliverySpeed,
      cost: totalCost,
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

    // Save order to database
    await order.save();
console.log("order: ",order)
    // Respond with success message and order details
    const customerDetails = await Order.findOne({customer:customer}).populate('customer');
    const message = `Your order has been created successfully with a total cost of ${order.cost}.`;
    await sendSms(customerDetails.customer.phoneNumber, message);
    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    // Handle errors
    res
      .status(400)
      .json({ error: "Error creating order", details: error.message });
  }
};

// Get orders by customer and populate customer, driver, and vehicle without password
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const customer = req.user.id;

    // Fetch orders and populate the customer, driver, and vehicle fields
    const orders = await Order.find({ customer })
      .populate({
        path: "driver",
        select: "-password", // Exclude password from driver
      })
      .populate({
        path: "vehicle",
        populate: {
          path: "driver",
          select: "-password", // Exclude password from vehicle's driver
        },
      })
      .populate({
        path: "customer",
        select: "-password", // Exclude password from customer
      });

    res.status(200).json(orders);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error fetching orders", details: error.message });
  }
};

exports.getOrdersForDriver = async (req, res) => {
  try {
    const driverId = req.user.id;

    // Debugging: Check if the driverId is correctly retrieved
    if (!driverId) {
      return res.status(400).json({ error: "Driver ID not found in request" });
    }

    // Fetch orders for the driver and populate the customer field
    const orders = await Order.find({ driver: driverId }).populate({
      path: "customer",
      select: "fullName", // Include only the 'fullName' field from customer
    });

    // Debugging: Check if orders are retrieved
    if (orders.length === 0) {
      return res.status(404).json({ error: "No orders found for this driver" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({
      error: "Error fetching orders",
      details: error.message,
    });
  }
};

// exports.declineOrder = async (req, res) => {
//   try {
//     const orderId = req.params.orderId;
//     const driverId = req.user.id;

//     const order = await Order.findById(orderId);

//     if (!order) {
//       return res.status(404).json({ error: "Order not found" });
//     }

//     if (order.driver && order.driver.toString() !== driverId) {
//       return res
//         .status(403)
//         .json({ error: "Unauthorized to decline this order" });
//     }

//     order.driver = null;
//     order.status = "declined";
//     await order.save();

//     res.status(200).json({ message: "Order declined successfully", order });
//   } catch (error) {
//     res
//       .status(400)
//       .json({ error: "Error declining order", details: error.message });
//   }
// };

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

    // Notify the customer
    await sendSms(order.customerPhoneNumber, `Your order ${orderId} has been declined.`);

    res.status(200).json({ message: "Order declined successfully", order });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error declining order", details: error.message });
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
    order.lastUpdatedBy = req.user.id; // Set lastUpdatedBy field
    await order.save();

    // Notify the customer
    await sendSms(order.customerPhoneNumber, `Your order ${orderId} status has been updated to ${status}.`);

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error updating order status", details: error.message });
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
    order.lastUpdatedBy = driver; // Set lastUpdatedBy field
    await order.save();

    // Notify the customer
    await sendSms(order.customerPhoneNumber, `Your order ${orderId} has been accepted.`);

    res.status(200).json({ message: "Order accepted", order });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error accepting order", details: error.message });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const driverId = req.body.id; // Assuming user ID is in req.user.id

    const order = await Order.findById(orderId).populate('customer');;
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.driver = driverId;
    order.lastUpdatedBy = driverId; // Set lastUpdatedBy field
    await order.save();

    
    // Notify the customer
    // await sendSms(order.customer.phoneNumber, `The driver for your order ${orderId} has been updated.`);

    res.status(200).json(order);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error updating driver", details: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const vehicleId = req.body.vehicleId;
    const driverId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.vehicle = vehicleId;
    order.lastUpdatedBy = driverId; // Set lastUpdatedBy field
    await order.save();

    // Notify the customer
    await sendSms(order.customerPhoneNumber, `The vehicle for your order ${orderId} has been updated.`);

    res.status(200).json({ message: "Vehicle updated", order });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error updating vehicle", details: error.message });
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
      return res.status(404).json({ message: "Order not found" });
    }

    // Notify the customer
    await sendSms(updatedOrder.customerPhoneNumber, `The delivery speed for your order ${orderId} has been updated to ${deliverySpeed}.`);

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
      return res.status(404).json({ message: "Order not found" });
    }

    // Notify the customer
    await sendSms(updatedOrder.customerPhoneNumber, `The tracking information for your order ${orderId} has been updated.`);

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};