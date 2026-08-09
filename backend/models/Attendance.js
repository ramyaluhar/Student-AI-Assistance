// models/Attendance.js
// Tracks per-subject attendance records so the dashboard can compute
// attendance percentage and warn the student if it drops below 75%.

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      required: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, subject: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
