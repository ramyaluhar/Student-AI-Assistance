// routes/noteRoutes.js
const express = require('express');
const router = express.Router();
const {
  uploadNote,
  getNotes,
  getNoteById,
  summarizeNote,
  exportNotePDF,
  deleteNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);
router.post('/upload', upload.single('file'), uploadNote);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.post('/:id/summarize', summarizeNote);
router.get('/:id/export', exportNotePDF);
router.delete('/:id', deleteNote);

module.exports = router;
