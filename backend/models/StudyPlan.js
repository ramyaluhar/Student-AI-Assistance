// models/StudyPlan.js
// Study planner: either user-created tasks or an AI-generated weekly plan.

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    task: { type: String, required: true },
    date: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // minutes
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, date: 1 });

// Separate top-level schema so we can query tasks directly by user/date
const studyTaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: { type: String, required: true },
    task: { type: String, required: true },
    date: { type: Date, required: true },
    duration: { type: Number, default: 60 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    completed: { type: Boolean, default: false },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyTask', studyTaskSchema);
