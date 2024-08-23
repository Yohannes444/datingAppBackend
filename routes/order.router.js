const express = require("express");
const {
  placeOrder,
  getOrdersByCustomer,
  acceptOrder,
  updateOrderStatus,
  getOrdersForDriver,
  declineOrder,
  getOrderDetails,
  getAllOrders,
  updateDriver,
  updateVehicle,
  updateDeliverySpeed,
  updateTracking,
  getordertemplet,
  getllDeveloperUserOrders,
  placeOrderfromAgent
} = require("../controllers/order.controller");
const helper = require("../middleware/Helpers/auth");
const router = express.Router();

router.post("/create",helper.validate, placeOrder);
router.post("/placeOrderfromAgent",helper.validateAgent, placeOrderfromAgent);
router.get("/customer", helper.validate, getOrdersByCustomer);
router.get("/driver", helper.validate, getOrdersForDriver);
router.get("/getordertemplet", helper.validateDeveloper, getordertemplet);
router.get("/getllDeveloperUserOrders", helper.validateDeveloper, getllDeveloperUserOrders);
router.get("/:orderId", helper.validate, getOrderDetails);
router.get("/", helper.validate, getAllOrders);

router.put("/accept/:orderId", helper.validate, acceptOrder);
router.put("/status", helper.validate, updateOrderStatus);
router.put("/decline/:orderId", helper.validate, declineOrder);
router.put("/update/driver/:orderId", updateDriver);
router.put("/update/vehicle/:orderId", helper.validate, updateVehicle);
router.put(  "/update/deliverySpeed/:orderId",  helper.validate,
   updateDeliverySpeed
);
router.put("/update/tracking/:orderId", helper.validate, updateTracking);

module.exports = router;
