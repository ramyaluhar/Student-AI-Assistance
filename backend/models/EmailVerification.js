// models/EmailVerification.js
// Stores temporary OTP information for email verification and password reset.

const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    otp: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ['registration', 'password-reset'],
      required: true,
    },

    registrationData: {
      name: String,
      password: String,
      college: String,
      branch: String,
      semester: Number,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Automatically delete expired OTP documents
emailVerificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model(
  'EmailVerification',
  emailVerificationSchema
);