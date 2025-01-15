const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    birthday: {
      type: Date,
      required: false,
    },
    sex: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: false,
    },
    preferences: [
      {
        preferenceId: {
          type: Schema.Types.ObjectId,
          ref: 'Preference', // Reference to the Preference model
          required: true,   // Each preference must have an ID
        },
        values: {
          type: [String], // Array of string values
          required: true, // Ensure values are provided
          default: [],    // Default to an empty array
        },
      },
    ],
    isStudent: {
      type: Boolean,
      default: false,
      required: false,
    },
    schoolName: {
      type: String,
      required: function () {
        return this.isStudent; // School name is required only if the user is a student
      },
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'], // Restrict role values to 'user' or 'admin'
      default: 'user',        // Default to 'user'
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('User', UserSchema);
