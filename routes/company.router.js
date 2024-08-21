const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const authMiddleware = require("../middleware/Helpers/auth");
const helper = require("../middleware/Helpers/auth");

// Middleware to authenticate requests
router.use(authMiddleware.validate);

// Define company management routes
router.post("/register", helper.validate, companyController.registerCompany);
router.get("/:companyId", helper.validate, companyController.getCompanyById);
router.put("/:companyId/update", helper.validate, companyController.updateCompanyDetails);
router.delete("/:companyId", helper.validate, companyController.deleteCompany);
router.post("/:companyId/vehicle/register", helper.validate, companyController.registerVehicle);
router.delete("/:companyId/vehicle/:vehicleId", helper.validate, companyController.deleteCompanyVehicle);
router.post("/:companyId/order/create", helper.validate, companyController.createOrder);
router.put("/:companyId/order/:orderId/assign-vehicle", helper.validate, companyController.assignVehicleToOrder);
router.put("/:companyId/order/:orderId/update-status", helper.validate, companyController.updateOrderStatus);
router.delete("/:companyId/order/:orderId", helper.validate, companyController.deleteCompanyOrder);
router.get("/:companyId/orders", helper.validate, companyController.getCompanyOrders);
router.get("/:companyId/order/:orderId/status", helper.validate, companyController.getOrderStatus);
router.put("/approvecompany/:companyId", helper.validate,companyController.approveCompany)
router.put("/disablecompany/:companyId", helper.validate,companyController.disableCompany)

module.exports = router;
