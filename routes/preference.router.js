const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preference.controller');

// Route to create a new preference
router.post('/', preferenceController.createPreference);

// Route to get all preferences
router.get('/', preferenceController.getAllPreferences);

// Route to get a preference by ID
router.get('/:preferenceId', preferenceController.getPreferenceById);

// Route to update a preference by ID
router.put('/:preferenceId', preferenceController.updatePreference);

// Route to delete a preference by ID
router.delete('/:preferenceId', preferenceController.deletePreference);

module.exports = router;
