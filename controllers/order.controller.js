const Order = require("../models/order.model");
const Vehicle = require("../models/vehicle.model");
const DriverWallet = require("../models/driverWallet"); // Adjust the path as needed
const User= require("../models/user.model")
const { io } = require("../server");
const axios = require ("axios")
const jwt = require("jsonwebtoken");
const config = require("../middleware/Helpers/config");
const Transaction = require("../models/transaction"); // Adjust the path as needed
const Service = require('../models/service'); // Import Service model
const CryptoJS = require("crypto-js");



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

  const lat1 = toRad(pickupLocation.lat);
  const lon1 = toRad(pickupLocation.lng);
  const lat2 = toRad(deliveryLocation.lat);
  const lon2 = toRad(deliveryLocation.lng);
  

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
}

// Calculate total volumetric weight
function calculateVolumetricWeight(items, volumetricFactor = 3000) {
  const totalVolume = items.reduce((total, item) => {
    const volume = item.height * item.size * item.size; // Assuming size represents both length and width
    return total + volume;
  }, 0);
  
  return totalVolume / volumetricFactor;
}



function calculateServiceCost(distance, packageWeight, service, deliverySpeed) {
  // Convert distance to hundred meters
  const distanceInHundredMeters = distance * 10; 

  const distanceCost = distanceInHundredMeters * Number(service.perHundredMeters);


  // Calculate driving time cost
  const averageDriveTimeMinutes = distance / 0.6; 
  const driveTimeCost = averageDriveTimeMinutes * Number(service.perMinuteDrive);

  const averageWaitTimeMinutes = 10; 
  const waitTimeCost = averageWaitTimeMinutes * Number(service.perMinuteWait);

  const weightCost = packageWeight * Number('10');

  const speedMultiplier = deliverySpeed === 'express' ? 1.5 : 1; 
  const baseCost = Number(service.baseFare) * speedMultiplier;

  const minimumFee= Number(service.minimumFee)
  const totalCost = Math.max(
    minimumFee,
    baseCost + distanceCost + driveTimeCost + waitTimeCost + weightCost
  );
  const touristMultiplier= Number(service.touristMultiplier)


  const finalCost = totalCost * (touristMultiplier || 1);


  return finalCost;
}

const decodeToken = async (token) => {
  const bytes = CryptoJS.AES.decrypt(token, config.secret);
  const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);

  try {
    const decoded = jwt.verify(decryptedToken, config.secret);
    return decoded;
  } catch (error) {
    return new Error("Invalid Token");
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const { packageDetails, pickupLocation, deliveryLocation, deliverySpeed, itemNames, serviceId } = req.body;

    let token = req.headers.authorization.split(" ")[1].toString();
    let data = await decodeToken(token);
    console.log("token: ",token)
    console.log("data: ",data)

    // Fetch service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(400).json({ error: "Service not found" });
    }

    // Calculate distance between pickup and delivery locations
    const distanceInKm = calculateDistanceInKm(pickupLocation, deliveryLocation);

    // Calculate volumetric weight based on package dimensions
    const volumetricWeight = calculateVolumetricWeight(itemNames);

    // Calculate delivery cost based on service parameters
    const totalCost = calculateServiceCost(
      distanceInKm,
      volumetricWeight,
      service,
      deliverySpeed
    );

    const customer = data.userId;

    // Create a new order
    const order = new Order({
      customer,
      packageDetails,
      pickupLocation: {
        address: pickupLocation.address,
        lat: pickupLocation.lat,
        lng: pickupLocation.lng,
      },
      destination: {
        address: deliveryLocation.address,
        lat: deliveryLocation.lat,
        lng: deliveryLocation.lng,
      },
      distanceInKm,
      deliverySpeed,
      cost: totalCost,
      tracking: {
        currentLocation: {
          lat: pickupLocation.lat,
          lng: pickupLocation.lng,
        },
        history: [
          {
            location: {
              lat: pickupLocation.lat,
              lng: pickupLocation.lng,
            },
            timestamp: new Date(),
          },
        ],
      },
      itemNames,
      createdBy: customer,
      lastUpdatedBy: customer,
      serviceId, // Save serviceId
    });

    if (data.role === "developer") {
      order.developersUserId = req.body.developersUserId;
    }

    await order.save();

    // Respond with success message and order details
    const customerDetails = await Order.findOne({ customer: customer }).populate('customer');
    const message = `Your order has been created successfully with a total cost of ${order.cost}.`;
    await sendSms(customerDetails.customer.phoneNumber, message);
    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    // Handle errors
    res.status(400).json({ error: "Error creating order", details: error.message });
  }
};


exports.placeOrderfromAgent = async (req, res) => {
  try {
    const { packageDetails, pickupLocation, deliveryLocation, deliverySpeed, itemNames, userId, orderType, serviceId } = req.body;

    // Fetch service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(400).json({ error: "Service not found" });
    }

    // Calculate distance between pickup and delivery locations
    const distanceInKm = calculateDistanceInKm(
      { lat: pickupLocation.lat, lng: pickupLocation.lng },
      { lat: deliveryLocation.lat, lng: deliveryLocation.lng }
    );

    // Calculate volumetric weight based on package dimensions
    const volumetricWeight = calculateVolumetricWeight(
      packageDetails.length,
      packageDetails.width,
      packageDetails.height
    );

    // Calculate delivery cost based on service parameters
    const totalCost = calculateServiceCost(
      distanceInKm,
      volumetricWeight,
      service,
      deliverySpeed
    );

    const customer = userId;

    // Create a new order
    const order = new Order({
      customer,
      packageDetails,
      pickupLocation: {
        address: pickupLocation.address,
        lat: pickupLocation.lat,
        lng: pickupLocation.lng,
      },
      destination: {
        address: deliveryLocation.address,
        lat: deliveryLocation.lat,
        lng: deliveryLocation.lng,
      },
      distanceInKm,
      deliverySpeed,
      cost: totalCost,
      tracking: {
        currentLocation: {
          lat: pickupLocation.lat,
          lng: pickupLocation.lng,
        },
        history: [
          {
            location: {
              lat: pickupLocation.lat,
              lng: pickupLocation.lng,
            },
            timestamp: new Date(),
          },
        ],
      },
      itemNames,
      createdBy: customer,
      lastUpdatedBy: customer,
      orderType: orderType,
      serviceId, // Save serviceId
    });

    await order.save();

    // Respond with success message and order details
    const customerDetails = await Order.findOne({ customer: customer }).populate('customer');
    const message = `Your order has been created successfully with a total cost of ${order.cost}.`;
    await sendSms(customerDetails.customer.phoneNumber, message);
    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    // Handle errors
    res.status(400).json({ error: "Error creating order", details: error.message });
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
    if (order.orderType === "user-created" && status === "completed") {
      // Calculate 10% of the order cost
      const commission = order.cost * 0.1;

      // Find the driver's wallet
      const driverWallet = await DriverWallet.findOne({ driver: order.driver });
      console.log("driver wallet: ", driverWallet)

      if (!driverWallet) {
        return res.status(404).json({ error: "Driver wallet not found" });
      }

      // Create a new transaction for the payment
      const transaction = new Transaction({
        amount: commission,
      });

      await transaction.save();

      // Add the transaction to the driver's wallet
      driverWallet.transactions.push({
        orderId: order._id,
        transactionType: "pay",
        transactionId: transaction._id,
      });

      // Subtract the commission from the driver's wallet balance
      driverWallet.balance -= commission;

      await driverWallet.save();
    }
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
    const driverId = req.body.driverId; // Assuming user ID is in req.user.id

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

exports.getordertemplet = async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1].toString();
    let data = await decodeToken(token);
  
    const developersUserId = req.query.developersUserId;

    const url = `http://localhost:4000/orederForm.html?token=${token}&developersUserId=${developersUserId}`;
    const response = {
      url: url
    };
    res.json(response);
  } catch (error) {
    console.error("Error in getordertemplet:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getllDeveloperUserOrders = async (req, res ) =>{
  try{

    const user= req.user
    const developerUserId= req.query.userId
    console.log("user: ", user)
    console.log("developerUserId: ", developerUserId)

    const orderList= await Order.find({customer:user, developersUserId:developerUserId})
    res.json(orderList)
  } catch (error) {
    console.error("Error in getordertemplet:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
    
}