// controllers/chatController.js
// Powers the AI Chat Assistant feature, including persisted chat history.

const asyncHandler = require('express-async-handler');
const Chat = require('../models/Chat');
const { getModel } = require('../config/gemini');

const SYSTEM_PROMPT = `You are an AI Study Assistant helping a college engineering student.
Be concise, clear, and educational. Use simple language, examples, and step-by-step
explanations when helpful. If asked about code, format it properly. Keep answers focused.`;

// @desc    Get all chat threads for the logged-in user (Chat History)
// @route   GET /api/chat
// @access  Private
const getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ user: req.user._id })
    .select('title createdAt updatedAt')
    .sort({ updatedAt: -1 });

  res.json({
    success: true,
    data: chats,
  });
});

// @desc    Get a single chat thread with full message history
// @route   GET /api/chat/:id
// @access  Private
const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  res.json({
    success: true,
    data: chat,
  });
});

// @desc    Send a message to the AI assistant
// @route   POST /api/chat/message
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { message, chatId } = req.body;

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error('Message cannot be empty');
  }

  let chat;

  // Existing chat
  if (chatId) {
    chat = await Chat.findOne({
      _id: chatId,
      user: req.user._id,
    });

    if (!chat) {
      res.status(404);
      throw new Error('Chat not found');
    }
  }

  // New chat
  else {
    chat = await Chat.create({
      user: req.user._id,
      title: message.substring(0, 40),
      messages: [],
    });
  }

  // Add current user message to database
  chat.messages.push({
    role: 'user',
    content: message,
  });

  // ---------------------------------------------------------
  // Build Gemini conversation history
  // ---------------------------------------------------------

  let history = chat.messages
    .slice(-10)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  // The last message is always the current user message.
  // Remove it from history because we send it separately below.
  const currentMessage = history.pop();

  // Gemini requires the conversation history to begin
  // with a message from the user, not the model.
  //
  // This also fixes old chats whose stored history may
  // accidentally begin with an assistant/model message.
  while (history.length > 0 && history[0].role !== 'user') {
    history.shift();
  }

  // ---------------------------------------------------------
  // Send request to Gemini
  // ---------------------------------------------------------

  const model = getModel(SYSTEM_PROMPT);

  const convo = model.startChat({
    history,
  });

  const result = await convo.sendMessage(
    currentMessage.parts[0].text
  );

  const aiText = result.response.text();

  // Save AI response
  chat.messages.push({
    role: 'assistant',
    content: aiText,
  });

  await chat.save();

  res.json({
    success: true,
    data: {
      chatId: chat._id,
      title: chat.title,
      reply: aiText,
    },
  });
});

// @desc    Delete a chat thread
// @route   DELETE /api/chat/:id
// @access  Private
const deleteChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  res.json({
    success: true,
    message: 'Chat deleted',
  });
});

module.exports = {
  getChats,
  getChatById,
  sendMessage,
  deleteChat,
};