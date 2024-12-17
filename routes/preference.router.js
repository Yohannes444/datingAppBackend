const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preference.controller');
const helper = require("../middleware/Helpers/auth");

// Route to create a new preference
router.post('/',helper.validateAdmin , preferenceController.createPreference);

// Route to get all preferences
router.get('/',helper.validateAdmin , preferenceController.getAllPreferences);

// Route to get a preference by ID
router.get('/:preferenceId',helper.validateAdmin , preferenceController.getPreferenceById);

// Route to update a preference by ID
router.put('/:preferenceId',helper.validateAdmin , preferenceController.updatePreference);

// Route to delete a preference by ID
router.delete('/:preferenceId',helper.validateAdmin , preferenceController.deletePreference);

module.exports = router;
