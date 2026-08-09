// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  getAttendanceSummary,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', markAttendance);
router.get('/', getAttendance);
router.get('/summary', getAttendanceSummary);
router.delete('/:id', deleteAttendance);

module.exports = router;
