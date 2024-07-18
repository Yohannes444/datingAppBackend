const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/Helpers/auth");
const reportsController = require("../controllers/reports.controller");

// Ensure authenticated access
router.use(authMiddleware.validate);

// Reporting and Analytics Endpoints
router.get("/total-orders", reportsController.getTotalOrders);
router.get("/orders-by-status", reportsController.getOrdersByStatus);
router.get("/revenue-by-month", reportsController.getRevenueByMonth);
router.get("/top-drivers", reportsController.getTopDrivers);
router.get("/average-delivery-time", reportsController.getAverageDeliveryTime);
router.get("/customer-satisfaction", reportsController.getCustomerSatisfaction);
router.get("/popular-locations", reportsController.getPopularLocations);
router.get("/monthly-growth", reportsController.getMonthlyGrowth);

module.exports = router;
