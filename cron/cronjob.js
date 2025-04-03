const cron = require('node-cron');
const RandomMatch = require('../models/randommache'); // Adjust path as needed

// Function to delete RandomMatch documents older than 5 hours
const cleanupOldRandomMatches = async () => {
  try {
    // Calculate the timestamp for 5 hours ago
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);

    // Find and delete all RandomMatch documents created more than 5 hours ago
    const result = await RandomMatch.deleteMany({
      createdAt: { $lt: fiveHoursAgo }
    });

    console.log(`Cleanup completed at ${new Date().toISOString()}: Deleted ${result.deletedCount} old RandomMatch documents`);
    
  } catch (error) {
    console.error('Error in cleanupOldRandomMatches:', error);
  }
};

// Schedule the cron job to run every 6 hours
// The schedule '0 */6 * * *' means "at minute 0 of every 6th hour"
cron.schedule('0 */6 * * *', cleanupOldRandomMatches, {
  scheduled: true,
  timezone: 'UTC' // Adjust timezone as needed
});


module.exports = cleanupOldRandomMatches;