const express = require("express");
const router = express.Router();
const driverWalletController = require("../controllers/wallet.controller");
const helper = require("../middleware/Helpers/auth");


// Add funds to wallet
router.post("/add-funds", helper.validate, driverWalletController.addFunds);

// Record a transaction
router.post("/record-transaction", helper.validate, driverWalletController.recordTransaction);

// Create a new wallet
router.post("/create", helper.validate, driverWalletController.createWallet);

// Fetch wallet balance
router.get("/:driverId", helper.validate, driverWalletController.getWallet);

module.exports = router;
