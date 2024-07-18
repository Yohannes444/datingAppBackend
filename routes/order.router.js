const express = require("express");
const {
  placeOrder,
  getOrdersByCustomer,
  acceptOrder,
  updateOrderStatus,
  getOrdersForDriver,
  declineOrder
} = require("../controllers/order.controller");
const helper = require("../middleware/Helpers/auth");
const router = express.Router();

router.post("/create", helper.validate, placeOrder);
router.get("/customer", helper.validate, getOrdersByCustomer);
router.get("/driver", helper.validate, getOrdersForDriver);
router.put("/accept/:orderId", helper.validate, acceptOrder);
router.put("/status", helper.validate, updateOrderStatus);
router.put("/decline/:orderId", helper.validate, declineOrder);

module.exports = router;
