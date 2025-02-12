const Subscription = require('../models/Subscription');


// Get a subscription by ID
const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('userId') // Optional: Populate user details
      .populate('paymentHistory'); // Optional: Populate payment details if available

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a subscription
const updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Update fields if provided in the request body
    if (req.body.status) subscription.status = req.body.status;
    if (req.body.type) subscription.type = req.body.type;
    if (req.body.paymentHistory) subscription.paymentHistory = req.body.paymentHistory;

    await subscription.save();
    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a subscription
const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSelfSubscription= async (req, res) => {
    try{
        const userId = req.user._id;
        const subscription = await Subscription.findOne({userId: userId})
        .populate('userId') // Optional: Populate user details
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
          }
          res.status(200).json(subscription);
    } catch (error) {
        res.status(500).json({ message: error.message });
      }
}   

module.exports = {

    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
    getSelfSubscription
    };