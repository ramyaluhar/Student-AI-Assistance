// routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', createAssignment);
router.get('/', getAssignments);
router.put('/:id', updateAssignment);
router.delete('/:id', deleteAssignment);

module.exports = router;
