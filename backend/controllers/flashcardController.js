// controllers/flashcardController.js
// AI Flashcard Generator: builds front/back study cards from a note or topic.

const asyncHandler = require('express-async-handler');
const FlashcardDeck = require('../models/Flashcard');
const Note = require('../models/Note');
const { generateText } = require('../config/gemini');

// @desc    Generate a new AI flashcard deck
// @route   POST /api/flashcards/generate
// @access  Private
const generateFlashcards = asyncHandler(async (req, res) => {
  const { noteId, topic, count = 10 } = req.body;

  let sourceText = '';
  let resolvedTitle = topic;

  if (noteId) {
    const note = await Note.findOne({ _id: noteId, user: req.user._id });
    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }
    sourceText = note.extractedText;
    resolvedTitle = note.title;
  }

  if (!sourceText && !topic) {
    res.status(400);
    throw new Error('Please provide either a noteId or a topic');
  }

  const prompt = `Create ${count} flashcards ${
    sourceText ? 'based strictly on the study material below' : `on the topic: "${topic}"`
  }.
Each flashcard should have a short "front" (question or term) and a concise "back" (answer or definition).
Return STRICT JSON only: an array of objects with "front" and "back" string fields. No extra text.

${sourceText ? `STUDY MATERIAL:\n"""${sourceText.substring(0, 12000)}"""` : ''}`;

  const raw = await generateText(prompt);

  let cards;
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    cards = JSON.parse(cleaned);
  } catch (e) {
    res.status(502);
    throw new Error('AI returned an invalid format. Please try again.');
  }

  const deck = await FlashcardDeck.create({
    user: req.user._id,
    note: noteId || null,
    title: resolvedTitle,
    cards,
  });

  res.status(201).json({ success: true, data: deck });
});

// @desc    List all flashcard decks
// @route   GET /api/flashcards
// @access  Private
const getDecks = asyncHandler(async (req, res) => {
  const decks = await FlashcardDeck.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: decks });
});

// @desc    Get a single deck
// @route   GET /api/flashcards/:id
// @access  Private
const getDeckById = asyncHandler(async (req, res) => {
  const deck = await FlashcardDeck.findOne({ _id: req.params.id, user: req.user._id });
  if (!deck) {
    res.status(404);
    throw new Error('Flashcard deck not found');
  }
  res.json({ success: true, data: deck });
});

// @desc    Delete a deck
// @route   DELETE /api/flashcards/:id
// @access  Private
const deleteDeck = asyncHandler(async (req, res) => {
  const deck = await FlashcardDeck.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!deck) {
    res.status(404);
    throw new Error('Flashcard deck not found');
  }
  res.json({ success: true, message: 'Deck deleted' });
});

module.exports = { generateFlashcards, getDecks, getDeckById, deleteDeck };
