// controllers/adminController.js
// Admin Panel: manage students, view platform-wide stats.

const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Note = require('../models/Note');
const Quiz = require('../models/Quiz');
const Chat = require('../models/Chat');

// @desc    List all students
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'student' }).sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

// @desc    Activate / deactivate a student account
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, data: { _id: user._id, isActive: user.isActive } });
});

// @desc    Delete a student account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, message: 'User deleted' });
});

// @desc    Platform-wide statistics for admin dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = asyncHandler(async (req, res) => {
  const [totalStudents, activeStudents, totalNotes, totalQuizzes, totalChats] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'student', isActive: true }),
    Note.countDocuments(),
    Quiz.countDocuments(),
    Chat.countDocuments(),
  ]);

  res.json({
    success: true,
    data: { totalStudents, activeStudents, totalNotes, totalQuizzes, totalChats },
  });
});

module.exports = { getAllUsers, toggleUserStatus, deleteUser, getPlatformStats };
