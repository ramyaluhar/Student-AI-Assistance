// server.js
// Entry point: sets up Express app, middleware, routes, and starts the server.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const noteRoutes = require('./routes/noteRoutes');
const quizRoutes = require('./routes/quizRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Trust Render's reverse proxy
app.set('trust proxy', 1);

// Security & core middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Basic rate limiting to protect the API (and Gemini quota) from abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// Serve uploaded files (e.g. for admin/debug access) statically
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AI Student Assistant API is running', time: new Date() });
});

// Mount feature routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// 404 + error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Safety net: log (rather than silently crash on) any promise rejection
// that slips past asyncHandler/errorHandler, and shut down cleanly on
// truly unrecoverable errors instead of leaving the process in a bad state.
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
