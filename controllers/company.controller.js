const Company = require("../models/company.model");
const Vehicle = require("../models/vehicle.model");
const Order = require("../models/order.model");

const registerCompany = async (req, res) => {
  try {
    const newCompany = new Company(req.body);
    const savedCompany = await newCompany.save();
    res.status(201).json(savedCompany);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId)
      .populate("admin vehicles orders");
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCompanyDetails = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.companyId, req.body, { new: true });
    res.json(company);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const registerVehicle = async (req, res) => {
  try {
    const { companyId } = req.params;
    const vehicle = new Vehicle(req.body);
    vehicle.driver = req.user._id; // Assuming the admin is also the driver
    const savedVehicle = await vehicle.save();
    
    const company = await Company.findById(companyId);
    company.vehicles.push(savedVehicle._id);
    await company.save();

    res.status(201).json(savedVehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteCompanyVehicle = async (req, res) => {
  try {
    const { companyId, vehicleId } = req.params;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const vehicleIndex = company.vehicles.indexOf(vehicleId);
    if (vehicleIndex > -1) {
      company.vehicles.splice(vehicleIndex, 1);
      await company.save();
      await Vehicle.findByIdAndDelete(vehicleId);
      res.json({ message: "Vehicle deleted successfully" });
    } else {
      res.status(404).json({ message: "Vehicle not found in company" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { companyId } = req.params;
    const order = new Order(req.body);
    const savedOrder = await order.save();
    
    const company = await Company.findById(companyId);
    company.orders.push(savedOrder._id);
    await company.save();

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const assignVehicleToOrder = async (req, res) => {
  try {
    const { companyId, orderId } = req.params;
    const { vehicleId } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.vehicle = vehicleId;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { companyId, orderId } = req.params;
    const { status } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteCompanyOrder = async (req, res) => {
  try {
    const { companyId, orderId } = req.params;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const orderIndex = company.orders.indexOf(orderId);
    if (orderIndex > -1) {
      company.orders.splice(orderIndex, 1);
      await company.save();
      await Order.findByIdAndDelete(orderId);
      res.json({ message: "Order deleted successfully" });
    } else {
      res.status(404).json({ message: "Order not found in company" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCompanyOrders = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId).populate("orders");
    if (!company) return res.status(404).json({ message: "Company not found" });

    res.json(company.orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ status: order.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const approveCompany= async (req, res) => {
  try {
    const { companyId } = req.params;
    const user = await Company.findByIdAndUpdate({ _id: companyId }, { active: true }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
const disableCompany= async (req, res) => {
  try {
    const { companyId } = req.params;
   
    const user = await Company.findByIdAndUpdate({ _id: companyId }, { active: false }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
module.exports = {
  registerCompany,
  getCompanyById,
  updateCompanyDetails,
  deleteCompany,
  registerVehicle,
  deleteCompanyVehicle,
  createOrder,
  assignVehicleToOrder,
  updateOrderStatus,
  deleteCompanyOrder,
  getCompanyOrders,
  getOrderStatus,
  approveCompany,
  disableCompany
};
