const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Link to the user who made the payment
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true, // Link to the associated subscription
    },
    razorpayOrderId: {
      type: String,
      required: true, // Razorpay order ID
    },
    razorpayPaymentId: {
      type: String,
      required: true, // Razorpay payment ID
    },
    razorpaySignature: {
      type: String,
      required: true, // Razorpay signature for verification
    },
    amount: {
      type: Number,
      required: true, // Amount in paise (e.g., 50000 for ₹500)
    },
    currency: {
      type: String,
      default: 'INR', // Default to Indian Rupees
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'success', // Set to 'success' after verification
    },
    paymentDate: {
      type: Date,
      default: Date.now, // When the payment was made
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

module.exports = mongoose.model('Payment', PaymentSchema);