// routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const {
  generateQuiz,
  getQuizzes,
  getQuizById,
  submitQuiz,
  deleteQuiz,
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/generate', generateQuiz);
router.get('/', getQuizzes);
router.get('/:id', getQuizById);
router.post('/:id/submit', submitQuiz);
router.delete('/:id', deleteQuiz);

module.exports = router;
