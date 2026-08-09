// routes/flashcardRoutes.js
const express = require('express');
const router = express.Router();
const {
  generateFlashcards,
  getDecks,
  getDeckById,
  deleteDeck,
} = require('../controllers/flashcardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/generate', generateFlashcards);
router.get('/', getDecks);
router.get('/:id', getDeckById);
router.delete('/:id', deleteDeck);

module.exports = router;
