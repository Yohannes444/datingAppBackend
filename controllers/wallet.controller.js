const DriverWallet = require("../models/driverWallet"); // Adjust the path as needed

// Fetch wallet balance
exports.getWallet = async (req, res) => {
  try {
    const { driverId } = req.params;
    const wallet = await DriverWallet.findOne({ driver: driverId });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.status(200).json({ balance: wallet.balance, transactions: wallet.transactions });
  } catch (error) {
    res.status(500).json({ error: "Error fetching wallet", details: error.message });
  }
};

// Add funds to wallet
exports.addFunds = async (req, res) => {
  try {
    const { driverId, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await DriverWallet.findOneAndUpdate(
      { driver: driverId },
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    );

    // Record the transaction
    await DriverWallet.updateOne(
      { driver: driverId },
      {
        $push: {
          transactions: {
            amount,
            type: "credit",
            description: "Funds added to wallet",
          },
        },
      }
    );

    res.status(200).json({ message: "Funds added successfully", balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ error: "Error adding funds", details: error.message });
  }
};

// Record a transaction
exports.recordTransaction = async (req, res) => {
    try {
      const { driverId, orderId, amount } = req.body;
  
      if (amount <= 0) {

        return res.status(400).json({ message: "Invalid amount" });
      }
  
      // Find or create wallet
      const wallet = await DriverWallet.findOneAndUpdate(
        { driver: driverId },
        { $inc: { balance: amount } },
        { new: true, upsert: true }
      );
  
      // Record the transaction
      await DriverWallet.updateOne(
        { driver: driverId },
        {
          $push: {
            transactions: {
              orderId,
              amount,
              date: new Date(),
            },
          },
        }
      );
  
      res.status(200).json({ message: "Transaction recorded successfully", balance: wallet.balance });
    } catch (error) {
      res.status(500).json({ error: "Error recording transaction", details: error.message });
    }
  };

  // Create a new wallet
exports.createWallet = async (req, res) => {
    try {
      const { driverId ,balance, transactions} = req.body;
  
      // Check if the wallet already exists
      const existingWallet = await DriverWallet.findOne({ driver: driverId });
      if (existingWallet) {
        return res.status(400).json({ message: "Wallet already exists for this driver" });
      }
  
      // Create a new wallet
      const newWallet = new DriverWallet({
        driver: driverId,
        balance: balance, // Initialize with 0 balance
        transactions: transactions, // Initialize with an empty transactions array
      });
  
      await newWallet.save();
  
      res.status(201).json({ message: "Wallet created successfully", wallet: newWallet });
    } catch (error) {
      res.status(500).json({ error: "Error creating wallet", details: error.message });
    }
  };
