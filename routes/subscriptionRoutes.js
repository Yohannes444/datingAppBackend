const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const helper = require("../middleware/Helpers/auth");


// get self subscription
router.get('/self', helper.validate, subscriptionController.getSelfSubscription);

// Get a subscription by ID
router.get('/:id', helper.validate, subscriptionController.getSubscriptionById);

// Update a subscription
router.put('/:id',helper.validate, subscriptionController.updateSubscription);

// Delete a subscription
router.delete('/:id',helper.validate, subscriptionController.deleteSubscription);

module.exports = router;
