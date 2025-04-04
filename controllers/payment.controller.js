const Razorpay = require("razorpay");
const crypto = require("crypto");
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment'); // Import the new Payment model

require("dotenv").config();

const creatpeyment = async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: req.body.amount * 100, // Convert to paise
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    instance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Something Went Wrong!" });
      }
      res.status(200).json({ data: order });
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const verfypeyment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      subscriptionId, // Expect subscriptionId in the request body
      amount, // Amount in INR from frontend
    } = req.body;

    // Verify the payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Find the subscription
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      // Step 1: Save payment details in the Payment model
      const payment = new Payment({
        userId: subscription.userId, // Link to the user from the subscription
        subscriptionId: subscription._id, // Link to this subscription
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: amount * 100, // Convert to paise
        status: 'success', // Payment verified
      });

      const savedPayment = await payment.save();

      // Step 2: Update the subscription
      subscription.paymentHistory.push(savedPayment._id); // Add payment to history
      subscription.status = "active"; // Activate the subscription
      subscription.lastPayment = new Date(); // Update last payment date

      // Set expiration date based on subscription type
      if (subscription.type === "monthly") {
        subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      } else if (subscription.type === "yearly") {
        subscription.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      }

      await subscription.save();

      res.status(201).json({
        message: "Payment verification successful",
        payment: savedPayment,
        subscription,
      });
    } else {
      res.status(400).json({ message: "Invalid signature" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  creatpeyment,
  verfypeyment,
};