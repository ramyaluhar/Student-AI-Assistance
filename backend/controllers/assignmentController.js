// controllers/assignmentController.js
// Assignment Reminder: CRUD + auto status detection for overdue items.

const asyncHandler = require('express-async-handler');
const Assignment = require('../models/Assignment');

// @desc    Create a new assignment reminder
// @route   POST /api/assignments
// @access  Private
const createAssignment = asyncHandler(async (req, res) => {
  const { title, subject, description, dueDate } = req.body;

  if (!title || !dueDate) {
    res.status(400);
    throw new Error('Title and due date are required');
  }

  const assignment = await Assignment.create({
    user: req.user._id,
    title,
    subject,
    description,
    dueDate,
  });

  res.status(201).json({ success: true, data: assignment });
});

// @desc    List all assignments, auto-flagging overdue ones
// @route   GET /api/assignments
// @access  Private
const getAssignments = asyncHandler(async (req, res) => {
  const assignments = await Assignment.find({ user: req.user._id }).sort({ dueDate: 1 });

  const now = new Date();
  const withStatus = assignments.map((a) => {
    const obj = a.toObject();
    if (obj.status !== 'completed' && new Date(obj.dueDate) < now) {
      obj.status = 'overdue';
    }
    return obj;
  });

  res.json({ success: true, data: withStatus });
});

// @desc    Update an assignment (status, details)
// @route   PUT /api/assignments/:id
// @access  Private
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findOne({ _id: req.params.id, user: req.user._id });
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  Object.assign(assignment, req.body);
  const updated = await assignment.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
// @access  Private
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  res.json({ success: true, message: 'Assignment deleted' });
});

module.exports = { createAssignment, getAssignments, updateAssignment, deleteAssignment };
