// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { getChats, getChatById, sendMessage, deleteChat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getChats);
router.post('/message', sendMessage);
router.get('/:id', getChatById);
router.delete('/:id', deleteChat);

module.exports = router;
