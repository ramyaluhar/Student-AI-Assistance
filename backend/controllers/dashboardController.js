// controllers/dashboardController.js
// Aggregates data across features into a single payload for the
// Daily Progress Dashboard (used to feed Chart.js on the frontend).

const asyncHandler = require('express-async-handler');
const Note = require('../models/Note');
const Quiz = require('../models/Quiz');
const FlashcardDeck = require('../models/Flashcard');
const StudyTask = require('../models/StudyPlan');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Chat = require('../models/Chat');

// @desc    Get aggregated dashboard stats for the logged-in user
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [
    notesCount,
    quizzes,
    decksCount,
    tasks,
    attendanceSummary,
    assignments,
    chatsCount,
  ] = await Promise.all([
    Note.countDocuments({ user: userId }),
    Quiz.find({ user: userId }).select('lastScore attempts createdAt topic'),
    FlashcardDeck.countDocuments({ user: userId }),
    StudyTask.find({ user: userId }).select('completed date subject'),
    Attendance.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$subject',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        },
      },
    ]),
    Assignment.find({ user: userId }).select('status dueDate'),
    Chat.countDocuments({ user: userId }),
  ]);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  const attemptedQuizzes = quizzes.filter((q) => q.lastScore !== null);
  const avgQuizScore = attemptedQuizzes.length
    ? Math.round(attemptedQuizzes.reduce((sum, q) => sum + q.lastScore, 0) / attemptedQuizzes.length)
    : 0;

  const overallAttendance = attendanceSummary.reduce(
    (acc, cur) => {
      acc.total += cur.total;
      acc.present += cur.present;
      return acc;
    },
    { total: 0, present: 0 }
  );
  const attendancePercent = overallAttendance.total
    ? Math.round((overallAttendance.present / overallAttendance.total) * 100)
    : 0;

  const pendingAssignments = assignments.filter(
    (a) => a.status !== 'completed' && new Date(a.dueDate) >= new Date()
  ).length;
  const overdueAssignments = assignments.filter(
    (a) => a.status !== 'completed' && new Date(a.dueDate) < new Date()
  ).length;

  res.json({
    success: true,
    data: {
      counts: {
        notes: notesCount,
        quizzes: quizzes.length,
        flashcardDecks: decksCount,
        chats: chatsCount,
        studyTasks: totalTasks,
        completedStudyTasks: completedTasks,
      },
      avgQuizScore,
      attendance: {
        percent: attendancePercent,
        bySubject: attendanceSummary.map((s) => ({
          subject: s._id,
          percent: Math.round((s.present / s.total) * 100),
        })),
      },
      assignments: {
        pending: pendingAssignments,
        overdue: overdueAssignments,
        total: assignments.length,
      },
      quizTrend: attemptedQuizzes
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((q) => ({ topic: q.topic, score: q.lastScore, date: q.createdAt })),
    },
  });
});

module.exports = { getDashboardStats };
