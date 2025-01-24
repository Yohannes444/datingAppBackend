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
    type: {
      type: String,
      enum: ['single-answer', 'multiple-answer'],
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Preference', PreferenceSchema);
