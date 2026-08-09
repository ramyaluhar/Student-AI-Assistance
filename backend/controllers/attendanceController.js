// controllers/attendanceController.js
// Attendance Tracker: mark multiple subjects and compute percentages.

const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');


// Convert incoming date into a safe Date object
const parseDate = (date) => {
  if (!date) {
    return new Date();
  }

  // If frontend sends YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number);

    return new Date(
      Date.UTC(year, month - 1, day)
    );
  }

  // If DD/MM/YYYY is sent
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [day, month, year] = date.split('/').map(Number);

    return new Date(
      Date.UTC(year, month - 1, day)
    );
  }

  return new Date(date);
};


// @desc    Mark attendance for a subject on a date
// @route   POST /api/attendance
// @access  Private
const markAttendance = asyncHandler(async (req, res) => {

  const { subject, date, status } = req.body;

  if (!subject || !status) {
    res.status(400);
    throw new Error('Subject and status are required');
  }

  if (!['present', 'absent'].includes(status)) {
    res.status(400);
    throw new Error('Invalid attendance status');
  }

  const attendanceDate = parseDate(date);

  if (Number.isNaN(attendanceDate.getTime())) {
    res.status(400);
    throw new Error('Invalid date');
  }


  // Find whether this subject already has a record
  // for the same date.
  const startOfDay = new Date(attendanceDate);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(attendanceDate);
  endOfDay.setUTCHours(23, 59, 59, 999);


  const existingRecord = await Attendance.findOne({
    user: req.user._id,
    subject: subject.trim(),
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });


  let record;

  if (existingRecord) {

    // Update instead of creating duplicate
    existingRecord.status = status;
    record = await existingRecord.save();

  } else {

    // Create a new attendance record
    record = await Attendance.create({
      user: req.user._id,
      subject: subject.trim(),
      date: attendanceDate,
      status,
    });

  }


  res.status(201).json({
    success: true,
    data: record,
  });
});


// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendance = asyncHandler(async (req, res) => {

  const { subject } = req.query;

  const query = {
    user: req.user._id,
  };

  if (subject) {
    query.subject = subject;
  }

  const records = await Attendance
    .find(query)
    .sort({ date: -1 });

  res.json({
    success: true,
    data: records,
  });
});


// @desc    Get attendance percentage summary grouped by subject
// @route   GET /api/attendance/summary
// @access  Private
const getAttendanceSummary = asyncHandler(async (req, res) => {

  const summary = await Attendance.aggregate([

    {
      $match: {
        user: req.user._id,
      },
    },

    {
      $group: {
        _id: '$subject',

        total: {
          $sum: 1,
        },

        present: {
          $sum: {
            $cond: [
              {
                $eq: ['$status', 'present'],
              },
              1,
              0,
            ],
          },
        },
      },
    },

    {
      $project: {
        subject: '$_id',
        _id: 0,
        total: 1,
        present: 1,

        percentage: {
          $round: [
            {
              $multiply: [
                {
                  $divide: [
                    '$present',
                    '$total',
                  ],
                },
                100,
              ],
            },
            1,
          ],
        },
      },
    },

    {
      $sort: {
        subject: 1,
      },
    },

  ]);

  res.json({
    success: true,
    data: summary,
  });
});


// @desc    Delete an attendance record
// @route   DELETE /api/attendance/:id
// @access  Private
const deleteAttendance = asyncHandler(async (req, res) => {

  const record = await Attendance.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!record) {
    res.status(404);
    throw new Error('Attendance record not found');
  }

  res.json({
    success: true,
    message: 'Record deleted',
  });
});


module.exports = {
  markAttendance,
  getAttendance,
  getAttendanceSummary,
  deleteAttendance,
};