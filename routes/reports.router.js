const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/Helpers/auth");
const reportsController = require("../controllers/reports.controller");
const helper = require("../middleware/Helpers/auth");

// Ensure authenticated access
router.use(authMiddleware.validate);

// Reporting and Analytics Endpoints
router.get("/total-orders", helper.validate, reportsController.getTotalOrders);
router.get("/orders-by-status", helper.validate, reportsController.getOrdersByStatus);
router.get("/revenue-by-month", helper.validate, reportsController.getRevenueByMonth);
router.get("/top-drivers", helper.validate, reportsController.getTopDrivers);
router.get("/average-delivery-time", helper.validate, reportsController.getAverageDeliveryTime);
router.get("/customer-satisfaction", helper.validate, reportsController.getCustomerSatisfaction);
router.get("/popular-locations", helper.validate, reportsController.getPopularLocations);
router.get("/monthly-growth", helper.validate, reportsController.getMonthlyGrowth);

module.exports = router;
