// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getPlatformStats,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/stats', getPlatformStats);

module.exports = router;
