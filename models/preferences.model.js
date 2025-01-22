const mongoose = require('mongoose');
const { Schema } = mongoose;

const PreferenceSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    value: {
      type: [String], // Array of string values
      required: true, // Ensure values are provided
      default: [],    // Default to an empty array
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Preference', PreferenceSchema);
