// models/User.js
// Represents both students and admins. Role field distinguishes access level.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 60,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },

    // Email verification xxxxxxxxxxx
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Registration OTP
    registrationOtp: {
      type: String,
      default: null,
      select: false,
    },

    registrationOtpExpires: {
      type: Date,
      default: null,
      select: false,
    },

    // Forgot password OTP
    resetPasswordOtp: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordOtpExpires: {
      type: Date,
      default: null,
      select: false,
    },

    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },

    avatar: {
      type: String,
      default: '',
    },

    college: {
      type: String,
      default: '',
    },

    branch: {
      type: String,
      default: '',
    },

    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },

    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
  },

  { timestamps: true }
);


// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});


// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', userSchema);