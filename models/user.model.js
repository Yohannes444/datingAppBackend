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
    Isverified: {
      type: Boolean,
      default: false,
      required: false,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    profileePicture: {
      type: String,
      required: false,
    },
    images: [
      {
        type: String,
        required: false,
      },
    ],
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
    status: {
      type: String,
      enum: ['active', 'pending', 'inactive'],
      default: 'pending',
      required: false,
    },
    contactRequset:[{
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: false,
    }],
    contactList:[{
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: false,
    }],

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
        displayPreference: {
          type: Boolean,
          default: true,
          required: false,
        },
      },
    ],
    isStudent: {
      type: Boolean,
      default: false,
      required: false,
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
    otp: {
      valuerequire:{
          type: Number,
          required: false,
        },
      IsUsed:{
        type: Boolean,
        default: false,
        required:false
      }
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
        address: {
          type: String, // Address of user's current location
          required: false,
          trim: true,
        }
      },
    },
    isRandemeChatOn: {
      type: Boolean,
      default: false,
      required: false,
    }
  
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('User', UserSchema);
