// controllers/noteController.js
// Handles PDF Notes Upload, AI Notes Summarizer, listing, and Export as PDF.

const asyncHandler = require('express-async-handler');
const path = require('path');
const Note = require('../models/Note');
const { extractTextFromPDF } = require('../utils/pdfParser');
const { generateText } = require('../config/gemini');
const { streamTextAsPDF } = require('../utils/pdfExport');

// @desc    Upload a PDF note (auto-extracts text)
// @route   POST /api/notes/upload
// @access  Private
const uploadNote = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a PDF file');
  }

  const { title, subject } = req.body;
  const extractedText = await extractTextFromPDF(req.file.path);

  const note = await Note.create({
    user: req.user._id,
    title: title || req.file.originalname,
    subject: subject || 'General',
    originalFileName: req.file.originalname,
    filePath: req.file.path,
    extractedText,
  });

  res.status(201).json({
    success: true,
    data: {
      _id: note._id,
      title: note.title,
      subject: note.subject,
      originalFileName: note.originalFileName,
      createdAt: note.createdAt,
    },
  });
});

// @desc    List all notes for the logged-in user
// @route   GET /api/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user._id })
    .select('-extractedText')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: notes });
});

// @desc    Get single note detail (includes summary)
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }
  res.json({ success: true, data: note });
});

// @desc    Generate an AI summary + key points for a note
// @route   POST /api/notes/:id/summarize
// @access  Private
const summarizeNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  if (!note.extractedText || note.extractedText.length < 20) {
    res.status(400);
    throw new Error('This PDF has no readable text to summarize');
  }

  const prompt = `Summarize the following study notes for a college student.
Return the response strictly as JSON with two fields:
"summary" (a clear paragraph summary, max 200 words) and
"keyPoints" (an array of 5-8 short bullet point strings).
Do not include any text outside the JSON object.

NOTES:
"""${note.extractedText.substring(0, 15000)}"""`;

  const raw = await generateText(prompt);

  let parsed;
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    // Fallback: treat entire response as summary text if JSON parsing fails
    parsed = { summary: raw, keyPoints: [] };
  }

  note.summary = parsed.summary || '';
  note.keyPoints = parsed.keyPoints || [];
  await note.save();

  res.json({ success: true, data: { summary: note.summary, keyPoints: note.keyPoints } });
});

// @desc    Export note's summary as a downloadable PDF
// @route   GET /api/notes/:id/export
// @access  Private
const exportNotePDF = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  const body = note.summary
    ? `SUMMARY\n\n${note.summary}\n\nKEY POINTS\n\n${note.keyPoints.map((k) => `• ${k}`).join('\n')}`
    : note.extractedText.substring(0, 5000);

  streamTextAsPDF(res, note.title, body);
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }
  res.json({ success: true, message: 'Note deleted' });
});

module.exports = {
  uploadNote,
  getNotes,
  getNoteById,
  summarizeNote,
  exportNotePDF,
  deleteNote,
};
