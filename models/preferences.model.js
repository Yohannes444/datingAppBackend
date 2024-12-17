const mongoose = require('mongoose');
const { Schema } = mongoose;

const PreferenceSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    value:[{
      type: String,
      required: false,
    }],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Preference', PreferenceSchema);
