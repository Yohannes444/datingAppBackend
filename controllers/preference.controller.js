const Preference = require('../models/preferences.model');
const { handleErrors } = require('../utils/errorHandler');

// Create a new preference
const createPreference = async (req, res) => {
  try {
    const { category, value } = req.body;
    const preference = new Preference({ category, value });
    await preference.save();
    res.status(201).json({ preference, status: 'ok' });
  } catch (err) {
    handleErrors(err, res);
  }
};

// Get all preferences
const getAllPreferences = async (req, res) => {
  try {
    const preferences = await Preference.find();
    res.status(200).json(preferences);
  } catch (err) {
    handleErrors(err, res);
  }
};

// Get preference by ID
const getPreferenceById = async (req, res) => {
  try {
    const { preferenceId } = req.params;
    const preference = await Preference.findById(preferenceId);

    if (!preference) {
      return res.status(404).json({ message: 'Preference not found' });
    }

    res.status(200).json(preference);
  } catch (err) {
    handleErrors(err, res);
  }
};

// Update preference by ID
const updatePreference = async (req, res) => {
  try {
    const { preferenceId } = req.params;
    const { category, value } = req.body;
    const updatedPreference = await Preference.findByIdAndUpdate(
      preferenceId,
      { category, value },
      { new: true }
    );

    if (!updatedPreference) {
      return res.status(404).json({ message: 'Preference not found' });
    }

    res.status(200).json({ updatedPreference, status: 'ok' });
  } catch (err) {
    handleErrors(err, res);
  }
};

// Delete preference by ID
const deletePreference = async (req, res) => {
  try {
    const { preferenceId } = req.params;
    const result = await Preference.findByIdAndDelete(preferenceId);

    if (!result) {
      return res.status(404).json({ message: 'Preference not found' });
    }

    res.status(200).json({ message: 'Preference deleted successfully', status: 'ok' });
  } catch (err) {
    handleErrors(err, res);
  }
};

module.exports = {
  createPreference,
  getAllPreferences,
  getPreferenceById,
  updatePreference,
  deletePreference,
};
