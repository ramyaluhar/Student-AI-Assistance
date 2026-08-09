// controllers/quizController.js
// AI Quiz Generator: builds MCQ quizzes from an uploaded note or a free topic.

const asyncHandler = require('express-async-handler');
const Quiz = require('../models/Quiz');
const Note = require('../models/Note');
const { generateText } = require('../config/gemini');

const buildQuizPrompt = (sourceText, topic, difficulty, count) => `
Create ${count} multiple choice questions (MCQs) at ${difficulty} difficulty level
${sourceText ? 'based strictly on the study material provided below' : `on the topic: "${topic}"`}.

Return STRICT JSON only, an array of objects, each with:
"question" (string), "options" (array of exactly 4 strings),
"correctAnswer" (must exactly match one of the options), "explanation" (short string).
Do not include any text outside the JSON array.

${sourceText ? `STUDY MATERIAL:\n"""${sourceText.substring(0, 12000)}"""` : ''}
`;

// @desc    Generate a new AI quiz (from a note or a free topic)
// @route   POST /api/quiz/generate
// @access  Private
const generateQuiz = asyncHandler(async (req, res) => {
  const { noteId, topic, difficulty = 'medium', count = 5 } = req.body;

  let sourceText = '';
  let resolvedTopic = topic;

  if (noteId) {
    const note = await Note.findOne({ _id: noteId, user: req.user._id });
    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }
    sourceText = note.extractedText;
    resolvedTopic = note.title;
  }

  if (!sourceText && !topic) {
    res.status(400);
    throw new Error('Please provide either a noteId or a topic');
  }

  const prompt = buildQuizPrompt(sourceText, topic, difficulty, count);
  const raw = await generateText(prompt);

  let questions;
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    questions = JSON.parse(cleaned);
  } catch (e) {
    res.status(502);
    throw new Error('AI returned an invalid format. Please try again.');
  }

  const quiz = await Quiz.create({
    user: req.user._id,
    note: noteId || null,
    topic: resolvedTopic,
    difficulty,
    questions,
  });

  res.status(201).json({ success: true, data: quiz });
});

// @desc    List all quizzes for the logged-in user
// @route   GET /api/quiz
// @access  Private
const getQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ user: req.user._id })
    .select('-questions.explanation')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: quizzes });
});

// @desc    Get a single quiz
// @route   GET /api/quiz/:id
// @access  Private
const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }
  res.json({ success: true, data: quiz });
});

// @desc    Submit answers and get score
// @route   POST /api/quiz/:id/submit
// @access  Private
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body; // array of selected option strings, same order as questions
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  let correct = 0;
  const result = quiz.questions.map((q, idx) => {
    const isCorrect = answers[idx] === q.correctAnswer;
    if (isCorrect) correct += 1;
    return {
      question: q.question,
      selected: answers[idx] || null,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const scorePercent = Math.round((correct / quiz.questions.length) * 100);
  quiz.lastScore = scorePercent;
  quiz.attempts += 1;
  await quiz.save();

  res.json({
    success: true,
    data: {
      score: scorePercent,
      correctCount: correct,
      total: quiz.questions.length,
      breakdown: result,
    },
  });
});

// @desc    Delete a quiz
// @route   DELETE /api/quiz/:id
// @access  Private
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }
  res.json({ success: true, message: 'Quiz deleted' });
});

module.exports = { generateQuiz, getQuizzes, getQuizById, submitQuiz, deleteQuiz };
