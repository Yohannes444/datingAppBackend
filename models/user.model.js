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
      unique: true,
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
      enum: ['male', 'female'],
      required: false,
    },

    preferences: [
      {
        preferenceID: {
          type: Schema.Types.ObjectId,
          ref: 'Preference', // Reference to Preference model
          required: false,
        },
        values: [{
          type: String, // Array of strings
          required: false,
        }],
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
      default: 'user', // Default to 'user'
    },
    locations: {
      birthPlace: {
        type: String, // User's birth place
        required: false,
        trim: true,
      },
      currentLocation: {
        latitude: {
          type: Number, // Latitude of user's current location
          required: false,
        },
        longitude: {
          type: Number, // Longitude of user's current location
          required: false,
        },
      },
    },
  
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('User', UserSchema);
