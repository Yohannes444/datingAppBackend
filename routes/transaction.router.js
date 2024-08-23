const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");
const helper = require("../middleware/Helpers/auth");


// Add funds to wallet
router.post("/create", helper.validate, transactionController.CreateTransaction);


module.exports = router;
