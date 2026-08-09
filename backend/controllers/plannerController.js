// controllers/plannerController.js
// Study Planner: manual CRUD tasks + an AI-assisted weekly plan generator.

const asyncHandler = require('express-async-handler');
const StudyTask = require('../models/StudyPlan');
const { generateText } = require('../config/gemini');

// @desc    Create a manual study task
// @route   POST /api/planner
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { subject, task, date, duration, priority } = req.body;

  if (!subject || !task || !date) {
    res.status(400);
    throw new Error('Subject, task, and date are required');
  }

  const created = await StudyTask.create({
    user: req.user._id,
    subject,
    task,
    date,
    duration,
    priority,
  });

  res.status(201).json({ success: true, data: created });
});

// @desc    Get all tasks (optionally filter by date range)
// @route   GET /api/planner
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const query = { user: req.user._id };

  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const tasks = await StudyTask.find(query).sort({ date: 1 });
  res.json({ success: true, data: tasks });
});

// @desc    Update a task (e.g. mark completed)
// @route   PUT /api/planner/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await StudyTask.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  Object.assign(task, req.body);
  const updated = await task.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete a task
// @route   DELETE /api/planner/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await StudyTask.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  res.json({ success: true, message: 'Task deleted' });
});

// @desc    Generate an AI weekly study plan across given subjects
// @route   POST /api/planner/ai-generate
// @access  Private
const generateAIPlan = asyncHandler(async (req, res) => {
  const { subjects, hoursPerDay = 2, startDate, examDate } = req.body;

  if (!subjects || !subjects.length) {
    res.status(400);
    throw new Error('Please provide at least one subject');
  }

  const prompt = `Create a 7-day study plan for a college student.
Subjects to cover: ${subjects.join(', ')}.
Available study time: ${hoursPerDay} hours per day.
${examDate ? `Exam date: ${examDate}.` : ''}
Start date: ${startDate || 'tomorrow'}.

Return STRICT JSON only: an array of task objects, each with:
"subject" (string, must be one of the given subjects),
"task" (short specific study task string),
"date" (ISO date string, YYYY-MM-DD),
"duration" (minutes, integer),
"priority" ("low", "medium", or "high").
Distribute tasks realistically across the 7 days. No text outside the JSON array.`;

  const raw = await generateText(prompt);

  let planItems;
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    planItems = JSON.parse(cleaned);
  } catch (e) {
    res.status(502);
    throw new Error('AI returned an invalid format. Please try again.');
  }

  const tasksToInsert = planItems.map((item) => ({
    user: req.user._id,
    subject: item.subject,
    task: item.task,
    date: new Date(item.date),
    duration: item.duration || 60,
    priority: item.priority || 'medium',
    aiGenerated: true,
  }));

  const inserted = await StudyTask.insertMany(tasksToInsert);
  res.status(201).json({ success: true, data: inserted });
});

module.exports = { createTask, getTasks, updateTask, deleteTask, generateAIPlan };
