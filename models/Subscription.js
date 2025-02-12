const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Only required field
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    type: {
      type: String,
      enum: ['monthly', 'yearly'], // You can add other types as needed
      default: 'monthly',
    },
    paymentHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Payment', // Change or remove ref if you do not have a Payment model
      },
    ],
    lastPayment: {
      type: Date,
      default: null, // Default is null, meaning no payment has been made yet
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model('Subscription', SubscriptionSchema);
