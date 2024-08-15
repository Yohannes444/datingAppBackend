const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const authMiddleware = require("../middleware/Helpers/auth");

// Middleware to authenticate requests
router.use(authMiddleware.validate);

// Define company management routes
router.post("/register", companyController.registerCompany);
router.get("/:companyId", companyController.getCompanyById);
router.put("/:companyId/update", companyController.updateCompanyDetails);
router.delete("/:companyId", companyController.deleteCompany);
router.post("/:companyId/vehicle/register", companyController.registerVehicle);
router.delete("/:companyId/vehicle/:vehicleId", companyController.deleteCompanyVehicle);
router.post("/:companyId/order/create", companyController.createOrder);
router.put("/:companyId/order/:orderId/assign-vehicle", companyController.assignVehicleToOrder);
router.put("/:companyId/order/:orderId/update-status", companyController.updateOrderStatus);
router.delete("/:companyId/order/:orderId", companyController.deleteCompanyOrder);
router.get("/:companyId/orders", companyController.getCompanyOrders);
router.get("/:companyId/order/:orderId/status", companyController.getOrderStatus);
router.put("/approvecompany/:companyId",companyController.approveCompany)
router.put("/disablecompany/:companyId",companyController.disableCompany)

module.exports = router;
