// models/Quiz.js
// Stores AI-generated MCQ quizzes tied to a note (or a free topic), plus attempt results.

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      validate: (v) => v.length === 4,
    },
    correctAnswer: { type: String, required: true }, // matches one of the options
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      default: null,
    },
    topic: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    // Attempt tracking
    lastScore: {
      type: Number,
      default: null,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
