// routes/plannerRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  generateAIPlan,
} = require('../controllers/plannerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/ai-generate', generateAIPlan);
router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
