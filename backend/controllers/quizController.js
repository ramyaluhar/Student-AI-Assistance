// controllers/quizController.js
// AI Quiz Generator: builds MCQ quizzes from an uploaded note or a free topic.

const asyncHandler = require('express-async-handler');
const Quiz = require('../models/Quiz');
const Note = require('../models/Note');
const { generateText } = require('../config/gemini');


// ============================================================
// HELPERS
// ============================================================

// Shuffle an array using Fisher-Yates algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
};


// ============================================================
// BUILD AI PROMPT
// ============================================================

const buildQuizPrompt = (
  sourceText,
  topic,
  difficulty,
  count
) => `
Create ${count} multiple choice questions (MCQs) at ${difficulty} difficulty level
${
  sourceText
    ? 'based strictly on the study material provided below'
    : `on the topic: "${topic}"`
}.

Return STRICT JSON only, an array of objects, each with:

"question" (string),
"options" (array of exactly 4 strings),
"correctAnswer" (must exactly match one of the options),
"explanation" (short string).

IMPORTANT:
- Make all 4 options meaningful and plausible.
- Do not always place the correct answer as the first option.
- Vary the position of the correct answer.
- Do not include any text outside the JSON array.

${
  sourceText
    ? `STUDY MATERIAL:
"""${sourceText.substring(0, 12000)}"""`
    : ''
}
`;


// ============================================================
// GENERATE QUIZ
// POST /api/quiz/generate
// @access Private
// ============================================================

const generateQuiz = asyncHandler(async (req, res) => {

  const {
    noteId,
    topic,
    difficulty = 'medium',
    count = 5,
  } = req.body;


  let sourceText = '';
  let resolvedTopic = topic;


  // ==========================================================
  // GET NOTE CONTENT
  // ==========================================================

  if (noteId) {

    const note = await Note.findOne({
      _id: noteId,
      user: req.user._id,
    });


    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }


    sourceText = note.extractedText;
    resolvedTopic = note.title;
  }


  // ==========================================================
  // VALIDATE SOURCE
  // ==========================================================

  if (!sourceText && !topic) {

    res.status(400);

    throw new Error(
      'Please provide either a noteId or a topic'
    );
  }


  // ==========================================================
  // GENERATE QUESTIONS USING AI
  // ==========================================================

  const prompt = buildQuizPrompt(
    sourceText,
    topic,
    difficulty,
    count
  );


  const raw = await generateText(prompt);


  let questions;


  try {

    const cleaned = raw
      .replace(/```json|```/g, '')
      .trim();


    questions = JSON.parse(cleaned);

  } catch (e) {

    console.error('AI Quiz JSON Error:', e);
    console.error('AI Raw Response:', raw);

    res.status(502);

    throw new Error(
      'AI returned an invalid format. Please try again.'
    );
  }


  // ==========================================================
  // VALIDATE AI RESPONSE
  // ==========================================================

  if (!Array.isArray(questions) || questions.length === 0) {

    res.status(502);

    throw new Error(
      'AI did not return valid quiz questions. Please try again.'
    );
  }


  // ==========================================================
  // SHUFFLE OPTIONS
  // ==========================================================

  questions = questions.map((question) => {

    // Make sure options exist
    if (
      !question.options ||
      !Array.isArray(question.options) ||
      question.options.length !== 4
    ) {

      res.status(502);

      throw new Error(
        'AI returned an invalid question format. Please try again.'
      );
    }


    // Make sure correctAnswer exists
    if (
      !question.correctAnswer ||
      !question.options.includes(question.correctAnswer)
    ) {

      res.status(502);

      throw new Error(
        'AI returned an invalid correct answer. Please try again.'
      );
    }


    // Shuffle only the options.
    //
    // correctAnswer remains the SAME string.
    //
    // Example:
    //
    // Before:
    // A = Database Management System
    // B = Database Maintenance System
    // C = Database Monitoring System
    // D = Database Manipulation System
    //
    // After:
    // A = Database Monitoring System
    // B = Database Management System
    // C = Database Manipulation System
    // D = Database Maintenance System

    return {
      ...question,
      options: shuffleArray(question.options),
    };

  });


  // ==========================================================
  // SAVE QUIZ
  // ==========================================================

  const quiz = await Quiz.create({

    user: req.user._id,

    note: noteId || null,

    topic: resolvedTopic,

    difficulty,

    questions,

  });


  // ==========================================================
  // RESPONSE
  // ==========================================================

  res.status(201).json({

    success: true,

    data: quiz,

  });

});


// ============================================================
// GET ALL QUIZZES
// GET /api/quiz
// @access Private
// ============================================================

const getQuizzes = asyncHandler(async (req, res) => {

  const quizzes = await Quiz.find({
    user: req.user._id,
  })
    .select('-questions.explanation')
    .sort({ createdAt: -1 });


  res.json({

    success: true,

    data: quizzes,

  });

});


// ============================================================
// GET SINGLE QUIZ
// GET /api/quiz/:id
// @access Private
// ============================================================

const getQuizById = asyncHandler(async (req, res) => {

  const quiz = await Quiz.findOne({

    _id: req.params.id,

    user: req.user._id,

  });


  if (!quiz) {

    res.status(404);

    throw new Error('Quiz not found');

  }


  res.json({

    success: true,

    data: quiz,

  });

});


// ============================================================
// SUBMIT QUIZ
// POST /api/quiz/:id/submit
// @access Private
// ============================================================

const submitQuiz = asyncHandler(async (req, res) => {

  const {
    answers,
  } = req.body;


  const quiz = await Quiz.findOne({

    _id: req.params.id,

    user: req.user._id,

  });


  if (!quiz) {

    res.status(404);

    throw new Error('Quiz not found');

  }


  let correct = 0;


  const result = quiz.questions.map((q, idx) => {

    const isCorrect =
      answers[idx] === q.correctAnswer;


    if (isCorrect) {
      correct += 1;
    }


    return {

      question: q.question,

      selected: answers[idx] || null,

      correctAnswer: q.correctAnswer,

      isCorrect,

      explanation: q.explanation,

    };

  });


  const scorePercent = Math.round(
    (correct / quiz.questions.length) * 100
  );


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


// ============================================================
// DELETE QUIZ
// DELETE /api/quiz/:id
// @access Private
// ============================================================

const deleteQuiz = asyncHandler(async (req, res) => {

  const quiz = await Quiz.findOneAndDelete({

    _id: req.params.id,

    user: req.user._id,

  });


  if (!quiz) {

    res.status(404);

    throw new Error('Quiz not found');

  }


  res.json({

    success: true,

    message: 'Quiz deleted',

  });

});


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

  generateQuiz,

  getQuizzes,

  getQuizById,

  submitQuiz,

  deleteQuiz,

};