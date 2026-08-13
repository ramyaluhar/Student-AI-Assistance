// config/db.js
// Handles the MongoDB connection using Mongoose.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Fail fast (10s) instead of the 30s default if MongoDB is
      // unreachable at startup — gives a clear, quick error in dev/CI.
      serverSelectionTimeoutMS: 10000,
      family: 4, // force IPv4 - avoids Render's IPv6 ENETUNREACH issue
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit the process with failure if DB connection fails at startup
    process.exit(1);
  }
};

module.exports = connectDB;