// utils/seedAdmin.js
// Run with: npm run seed:admin
// Creates a default admin account if one does not already exist.

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seed = async () => {
  await connectDB();

  const existing = await User.findOne({ email: 'admin@studentassistant.com' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }

  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@studentassistant.com',
    password: 'Admin@123',
    role: 'admin',
  });

  console.log('✅ Admin created:', admin.email, '(password: Admin@123 — change this immediately)');
  mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
