const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAgents
} = require('../controllers/userController');

const router = express.Router();

// All user routes require authentication and admin access
router.use(protect);
router.use(authorize('Admin'));

// Get all users
router.get('/', getAllUsers);

// Get single user
router.get('/:userId', getUserById);

// Get all agents
router.get('/agents', getAgents);

// Update user
router.put('/:userId', updateUser);

// Delete user
router.delete('/:userId', deleteUser);

module.exports = router;
