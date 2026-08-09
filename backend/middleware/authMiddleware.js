// middleware/authMiddleware.js
// Verifies the JWT sent in the Authorization header and attaches
// the authenticated user (minus password) to req.user.

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  const token = authHeader.split(' ')[1];

  // Step 1: verify the JWT itself. Only failures here are genuinely
  // "bad/expired token" — kept in its own try/catch so they're never
  // confused with unrelated failures (e.g. a database timeout) below.
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed or expired');
  }

  // Step 2: look up the user. Left outside the JWT try/catch so a DB
  // connectivity issue surfaces as its own real error (caught by the
  // global error handler) instead of being mislabeled as a token problem.
  req.user = await User.findById(decoded.id).select('-password');

  if (!req.user) {
    res.status(401);
    throw new Error('User not found. Token invalid.');
  }

  if (!req.user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Contact admin.');
  }

  next();
});

// Restrict a route to admin users only. Use AFTER `protect`.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Admin access required for this route');
};

module.exports = { protect, adminOnly };
