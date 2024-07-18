const Order = require("../models/order.model");
const Rating = require("../models/rating.model");

// Get total number of orders
exports.getTotalOrders = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    res.status(200).json({ totalOrders });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch total orders", details: error.message });
  }
};

// Get orders count by status
exports.getOrdersByStatus = async (req, res) => {
  try {
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    res.status(200).json({ ordersByStatus });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch orders by status",
      details: error.message,
    });
  }
};

// Get revenue by month
exports.getRevenueByMonth = async (req, res) => {
  try {
    const revenueByMonth = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$cost" },
        },
      },
    ]);
    res.status(200).json({ revenueByMonth });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch revenue by month",
      details: error.message,
    });
  }
};

// Get top performing drivers
exports.getTopDrivers = async (req, res) => {
  try {
    const topDrivers = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$driver",
          totalOrdersCompleted: { $sum: 1 },
        },
      },
      { $sort: { totalOrdersCompleted: -1 } },
      { $limit: 10 },
    ]);
    res.status(200).json({ topDrivers });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch top drivers", details: error.message });
  }
};

// Get average delivery time
exports.getAverageDeliveryTime = async (req, res) => {
  try {
    const averageDeliveryTime = await Order.aggregate([
      {
        $match: { status: "completed" },
      },
      {
        $group: {
          _id: null,
          averageDeliveryTime: {
            $avg: { $subtract: ["$updatedAt", "$createdAt"] },
          },
        },
      },
    ]);
    res.status(200).json({ averageDeliveryTime });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch average delivery time",
      details: error.message,
    });
  }
};

// Get customer satisfaction ratings
exports.getCustomerSatisfaction = async (req, res) => {
  try {
    const customerSatisfaction = await Rating.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          feedback: { $push: "$feedback" },
        },
      },
    ]);
    res.status(200).json({ customerSatisfaction });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch customer satisfaction data",
      details: error.message,
    });
  }
};

// Get popular delivery locations
exports.getPopularLocations = async (req, res) => {
  try {
    const popularLocations = await Order.aggregate([
      { $group: { _id: "$deliveryLocation", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.status(200).json({ popularLocations });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch popular locations",
      details: error.message,
    });
  }
};

// Get monthly growth
exports.getMonthlyGrowth = async (req, res) => {
  try {
    const monthlyGrowth = await Order.aggregate([
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Calculate growth percentage
    const growthPercentage = [];
    for (let i = 1; i < monthlyGrowth.length; i++) {
      const previousCount = monthlyGrowth[i - 1].count;
      const currentCount = monthlyGrowth[i].count;
      const growth = ((currentCount - previousCount) / previousCount) * 100;
      growthPercentage.push({ month: monthlyGrowth[i]._id, growth: growth });
    }

    res.status(200).json({ monthlyGrowth, growthPercentage });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch monthly growth",
      details: error.message,
    });
  }
};
