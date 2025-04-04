const express = require("express");
const router = express.Router();
const paymentcontroller = require("../controllers/payment.controller");
const authMiddleware = require("../middleware/Helpers/auth");
const helper = require("../middleware/Helpers/auth");

// Middleware to authenticate requests
// router.use(authMiddleware.validate);

 router.post("/orders",  paymentcontroller.creatpeyment);
 router.post("/verify", paymentcontroller.verfypeyment);


module.exports = router;
