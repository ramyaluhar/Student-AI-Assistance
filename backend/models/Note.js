// models/Note.js
// Stores metadata + extracted text for uploaded PDF notes, and the AI-generated summary.

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      default: 'General',
    },
    originalFileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String, // raw text parsed from PDF, used as source for AI features
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    keyPoints: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
