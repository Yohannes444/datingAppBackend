const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');

// Function to check and update subscriptions
const checkSubscriptions = async () => {
  console.log("Running subscription check...");

  try {
    const today = new Date();

    const subscriptions = await Subscription.find({ status: 'active' });

    subscriptions.forEach(async (subscription) => {
      if (!subscription.lastPayment) return; // Skip if no payment has been made

      let expiryDate = new Date(subscription.lastPayment);

      // Set expiration based on subscription type
      if (subscription.type === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (subscription.type === 'yearly') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      // If expired, set status to inactive
      if (expiryDate < today) {
        subscription.status = 'inactive';
        await subscription.save();
        console.log(`Subscription for user ${subscription.userId} is now inactive.`);
      }
    });

  } catch (error) {
    console.error('Error checking subscriptions:', error);
  }
};

// Schedule the job to run at **midnight (00:00) every day**
cron.schedule('0 0 * * *', checkSubscriptions);

module.exports = checkSubscriptions;
