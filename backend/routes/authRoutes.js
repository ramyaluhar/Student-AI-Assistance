// routes/authRoutes.js

const express = require('express');
const router = express.Router();

const {
  registerUser,
  verifyEmail,
  resendOtp,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getProfile,
  updateProfile,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

const {
  validate,
  registerRules,
  loginRules,
} = require('../middleware/validateMiddleware');


// ============================================================
// REGISTRATION
// ============================================================

// Step 1: Submit registration details + send OTP
router.post(
  '/register',
  registerRules,
  validate,
  registerUser
);

// Step 2: Verify registration OTP
router.post(
  '/verify-email',
  verifyEmail
);

// Compatibility route for existing frontend
router.post(
  '/verify-registration',
  verifyEmail
);

// Resend registration OTP
router.post(
  '/resend-otp',
  resendOtp
);


// ============================================================
// LOGIN
// ============================================================

router.post(
  '/login',
  loginRules,
  validate,
  loginUser
);


// ============================================================
// FORGOT PASSWORD
// ============================================================

// Step 1: Request password-reset OTP
router.post(
  '/forgot-password',
  forgotPassword
);

// Step 2: Verify password-reset OTP
router.post(
  '/verify-reset-otp',
  verifyResetOtp
);

// Step 3: Set new password
router.post(
  '/reset-password',
  resetPassword
);


// ============================================================
// PROFILE
// ============================================================

// Get logged-in user's profile
router.get(
  '/profile',
  protect,
  getProfile
);

// Update logged-in user's profile
router.put(
  '/profile',
  protect,
  updateProfile
);


module.exports = router;