const Transaction = require("../models/transaction"); // Adjust the path as needed

// Fetch Transaction balance
exports.CreateTransaction = async (req, res) => {
    try {
        const { amount} = req.body;
    
        // Create a new Transaction
        const newTransaction = new Transaction({
            amount: amount 
        });
    
        await newTransaction.save();
    
        res.status(200).json({ message: "Transaction created successfully", Transaction: newTransaction });
      } catch (error) {
        res.status(500).json({ error: "Error creating Transaction", details: error.message });
      }
};