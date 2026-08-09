// controllers/authController.js
// Handles registration, email OTP verification,
// login, forgot password, password reset,
// and profile management.

const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');


// ============================================================
// HELPERS
// ============================================================

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const normalizeEmail = (email) => {
  return String(email || '').toLowerCase().trim();
};


// ============================================================
// SEND OTP EMAIL
// ============================================================

const sendOtpEmail = async (email, otp, purpose) => {

  const isRegistration = purpose === 'registration';

  const subject = isRegistration
    ? 'Verify your AI Student Assistant account'
    : 'AI Student Assistant - Password Reset OTP';

  const title = isRegistration
    ? 'Verify Your Email'
    : 'Reset Your Password';

  const message = isRegistration
    ? 'Use the OTP below to verify your email address and complete your registration.'
    : 'Use the OTP below to reset your AI Student Assistant password.';

  await sendEmail({
    to: email,
    subject,

    text:
      `${title}\n\n` +
      `${message}\n\n` +
      `Your OTP is: ${otp}\n\n` +
      `This OTP will expire in 10 minutes.\n\n` +
      `If you did not request this, you can safely ignore this email.`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 500px;
        margin: auto;
        padding: 30px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
      ">

        <h2>${title}</h2>

        <p style="color:#555;">
          ${message}
        </p>

        <div style="
          margin:25px 0;
          padding:18px;
          background:#f3f4f6;
          border-radius:10px;
          text-align:center;
        ">

          <div style="
            font-size:32px;
            font-weight:bold;
            letter-spacing:8px;
          ">
            ${otp}
          </div>

        </div>

        <p style="color:#777;font-size:13px;">
          This OTP will expire in <strong>10 minutes</strong>.
        </p>

        <p style="color:#777;font-size:13px;">
          If you did not request this, you can safely ignore this email.
        </p>

        <hr style="border:0;border-top:1px solid #eee;">

        <p style="color:#999;font-size:12px;">
          AI Student Assistant
        </p>

      </div>
    `,
  });
};


// ============================================================
// REGISTER
// POST /api/auth/register
// ============================================================

const registerUser = asyncHandler(async (req, res) => {

  const {
    name,
    email,
    password,
    college,
    branch,
    semester,
  } = req.body;

  const normalizedEmail = normalizeEmail(email);


  // Check required fields
  if (!name || !normalizedEmail || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }


  // Check if account already exists
  const userExists = await User.findOne({
    email: normalizedEmail,
  });

  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }


  // Generate OTP
  const otp = generateOtp();

  // OTP expires in 10 minutes
  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );


  // Delete previous registration OTP
  await EmailVerification.deleteMany({
    email: normalizedEmail,
    purpose: 'registration',
  });


  /*
   * IMPORTANT:
   *
   * We store the password temporarily in the OTP document.
   * This document automatically expires after 10 minutes.
   *
   * We DO NOT hash it here because User.js already hashes
   * passwords using its pre-save hook.
   */
  await EmailVerification.create({

    email: normalizedEmail,

    otp,

    purpose: 'registration',

    registrationData: {
      name: name.trim(),
      password,
      college: college || '',
      branch: branch || '',
      semester: Number(semester) || 1,
    },

    expiresAt,
  });


  // Send OTP
  await sendOtpEmail(
    normalizedEmail,
    otp,
    'registration'
  );


  res.status(200).json({
    success: true,
    message: 'OTP sent to your email address',

    data: {
      email: normalizedEmail,
    },
  });
});


// ============================================================
// VERIFY REGISTRATION EMAIL
// POST /api/auth/verify-email
// ============================================================

const verifyEmail = asyncHandler(async (req, res) => {

  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error('Email and OTP are required');
  }

  const normalizedEmail = normalizeEmail(email);


  // Find registration OTP
  const verification = await EmailVerification.findOne({
    email: normalizedEmail,
    purpose: 'registration',
  });


  if (!verification) {
    res.status(400);
    throw new Error(
      'OTP not found or expired. Please request a new OTP.'
    );
  }


  // Check expiry
  if (verification.expiresAt < new Date()) {

    await EmailVerification.deleteOne({
      _id: verification._id,
    });

    res.status(400);

    throw new Error(
      'OTP has expired. Please request a new OTP.'
    );
  }


  // Check OTP
  if (
    verification.otp !== String(otp).trim()
  ) {

    res.status(400);

    throw new Error('Invalid OTP');
  }


  // Make sure user wasn't created meanwhile
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {

    await EmailVerification.deleteOne({
      _id: verification._id,
    });

    res.status(400);

    throw new Error(
      'An account with this email already exists'
    );
  }


  // ========================================================
  // CREATE USER
  // ========================================================

  /*
   * IMPORTANT:
   *
   * User.js has a bcrypt pre-save hook.
   *
   * Therefore we give User.create() the ORIGINAL password.
   * User.js will hash it exactly ONCE.
   *
   * DO NOT bcrypt.hash() this password here.
   */

  const user = await User.create({
    name: verification.registrationData.name,
    email: normalizedEmail,
    password: verification.registrationData.password,
    college: verification.registrationData.college || '',
    branch: verification.registrationData.branch || '',
    semester:
      verification.registrationData.semester || 1,

  // Email has been successfully verified through OTP
  isEmailVerified: true,
  });


  // Delete used OTP
  await EmailVerification.deleteOne({
    _id: verification._id,
  });


  // Generate login token
  const token = generateToken(user._id);


  res.status(201).json({

    success: true,

    message:
      'Email verified and account created successfully',

    data: {

      _id: user._id,

      name: user.name,

      email: user.email,

      role: user.role,

      theme: user.theme,

      avatar: user.avatar,

      token,
    },
  });
});


// ============================================================
// RESEND REGISTRATION OTP
// POST /api/auth/resend-otp
// ============================================================

const resendOtp = asyncHandler(async (req, res) => {

  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const normalizedEmail = normalizeEmail(email);


  // Find pending registration
  const verification =
    await EmailVerification.findOne({
      email: normalizedEmail,
      purpose: 'registration',
    });


  if (!verification) {

    res.status(404);

    throw new Error(
      'Registration session not found. Please register again.'
    );
  }


  // Generate new OTP
  const otp = generateOtp();

  verification.otp = otp;

  verification.expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );


  await verification.save();


  // Send new OTP
  await sendOtpEmail(
    normalizedEmail,
    otp,
    'registration'
  );


  res.json({

    success: true,

    message:
      'A new OTP has been sent to your email',
  });
});


// ============================================================
// LOGIN
// POST /api/auth/login
// ============================================================
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = normalizeEmail(email);

  // Email is required
  if (!normalizedEmail) {
    res.status(400);
    throw new Error('Email is required');
  }

  // Password is required
  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  // Find user including password
  const user = await User.findOne({
    email: normalizedEmail,
  }).select('+password');

  // Email is not registered
  if (!user) {
    res.status(404);
    throw new Error(
      'No account found with this email. Please register yourself first.'
    );
  }

  // Check whether email is verified
  if (!user.isEmailVerified) {
    res.status(403);
    throw new Error(
      'Please verify your email before logging in.'
    );
  }

  // Check password
  const passwordMatch = await user.matchPassword(password);

  if (!passwordMatch) {
    res.status(401);
    throw new Error('Incorrect password');
  }

  // Check active account
  if (!user.isActive) {
    res.status(403);
    throw new Error(
      'Your account has been deactivated. Contact admin.'
    );
  }

  // Login successful
  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      theme: user.theme,
      avatar: user.avatar,
      token: generateToken(user._id),
    },
  });


  // Generate token
  const token = generateToken(user._id);


  res.json({

    success: true,

    data: {

      _id: user._id,

      name: user.name,

      email: user.email,

      role: user.role,

      theme: user.theme,

      avatar: user.avatar,

      token,
    },
  });
});


// ============================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ============================================================

const forgotPassword = asyncHandler(async (req, res) => {

  const { email } = req.body;

  if (!email) {

    res.status(400);

    throw new Error('Email is required');
  }


  const normalizedEmail = normalizeEmail(email);


  const user = await User.findOne({
    email: normalizedEmail,
  });


  /*
   * Don't reveal whether an email exists.
   */
  if (!user) {

    return res.json({

      success: true,

      message:
        'If an account exists with this email, an OTP has been sent.',
    });
  }


  // Generate OTP
  const otp = generateOtp();

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );


  // Delete old reset OTP
  await EmailVerification.deleteMany({
    email: normalizedEmail,
    purpose: 'password-reset',
  });


  // Create reset OTP
  await EmailVerification.create({

    email: normalizedEmail,

    otp,

    purpose: 'password-reset',

    expiresAt,
  });


  // Send OTP
  await sendOtpEmail(
    normalizedEmail,
    otp,
    'password-reset'
  );


  res.json({

    success: true,

    message:
      'If an account exists with this email, an OTP has been sent.',
  });
});


// ============================================================
// VERIFY RESET OTP
// POST /api/auth/verify-reset-otp
// ============================================================

const verifyResetOtp = asyncHandler(async (req, res) => {

  const { email, otp } = req.body;

  if (!email || !otp) {

    res.status(400);

    throw new Error(
      'Email and OTP are required'
    );
  }


  const normalizedEmail = normalizeEmail(email);


  const verification =
    await EmailVerification.findOne({

      email: normalizedEmail,

      purpose: 'password-reset',
    });


  if (!verification) {

    res.status(400);

    throw new Error(
      'OTP not found or expired. Please request a new OTP.'
    );
  }


  // Check expiry
  if (verification.expiresAt < new Date()) {

    await EmailVerification.deleteOne({
      _id: verification._id,
    });

    res.status(400);

    throw new Error(
      'OTP has expired. Please request a new OTP.'
    );
  }


  // Check OTP
  if (
    verification.otp !== String(otp).trim()
  ) {

    res.status(400);

    throw new Error('Invalid OTP');
  }


  res.json({

    success: true,

    message: 'OTP verified successfully',
  });
});


// ============================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// ============================================================

const resetPassword = asyncHandler(async (req, res) => {

  const {
    email,
    otp,
    password,
  } = req.body;


  if (!email || !otp || !password) {

    res.status(400);

    throw new Error(
      'Email, OTP and new password are required'
    );
  }


  if (password.length < 6) {

    res.status(400);

    throw new Error(
      'Password must be at least 6 characters'
    );
  }


  const normalizedEmail = normalizeEmail(email);


  // Find reset OTP
  const verification =
    await EmailVerification.findOne({

      email: normalizedEmail,

      purpose: 'password-reset',
    });


  if (!verification) {

    res.status(400);

    throw new Error(
      'OTP not found or expired. Please request a new OTP.'
    );
  }


  // Check expiry
  if (verification.expiresAt < new Date()) {

    await EmailVerification.deleteOne({
      _id: verification._id,
    });

    res.status(400);

    throw new Error(
      'OTP has expired. Please request a new OTP.'
    );
  }


  // Check OTP
  if (
    verification.otp !== String(otp).trim()
  ) {

    res.status(400);

    throw new Error('Invalid OTP');
  }


  // Find user
  const user = await User.findOne({
    email: normalizedEmail,
  });


  if (!user) {

    await EmailVerification.deleteOne({
      _id: verification._id,
    });

    res.status(400);

    throw new Error(
      'Unable to reset password'
    );
  }


  /*
   * IMPORTANT:
   *
   * Assign plain password.
   *
   * User.js pre-save hook will hash it ONCE.
   */
  user.password = password;

  await user.save();


  // Delete OTP after successful reset
  await EmailVerification.deleteOne({
    _id: verification._id,
  });


  res.json({

    success: true,

    message:
      'Password reset successfully. You can now log in.',
  });
});


// ============================================================
// GET PROFILE
// GET /api/auth/profile
// ============================================================

const getProfile = asyncHandler(async (req, res) => {

  const user = await User.findById(
    req.user._id
  );


  if (!user) {

    res.status(404);

    throw new Error('User not found');
  }


  res.json({

    success: true,

    data: user,
  });
});


// ============================================================
// UPDATE PROFILE
// PUT /api/auth/profile
// ============================================================

const updateProfile = asyncHandler(async (req, res) => {

  const user = await User.findById(
    req.user._id
  );


  if (!user) {

    res.status(404);

    throw new Error('User not found');
  }


  user.name =
    req.body.name ?? user.name;

  user.college =
    req.body.college ?? user.college;

  user.branch =
    req.body.branch ?? user.branch;

  user.semester =
    req.body.semester ?? user.semester;

  user.avatar =
    req.body.avatar ?? user.avatar;

  user.theme =
    req.body.theme ?? user.theme;


  /*
   * Password is optional.
   *
   * If supplied, User.js hashes it once.
   */
  if (req.body.password) {

    if (req.body.password.length < 6) {

      res.status(400);

      throw new Error(
        'Password must be at least 6 characters'
      );
    }

    user.password = req.body.password;
  }


  const updated = await user.save();


  res.json({

    success: true,

    data: {

      _id: updated._id,

      name: updated.name,

      email: updated.email,

      role: updated.role,

      theme: updated.theme,

      college: updated.college,

      branch: updated.branch,

      semester: updated.semester,

      avatar: updated.avatar,
    },
  });
});


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  registerUser,
  verifyEmail,
  resendOtp,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getProfile,
  updateProfile,
};