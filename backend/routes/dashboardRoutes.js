const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const { getDashboardStats } = require('../controllers/dashboardController');

const router = express.Router();

// Dashboard routes require authentication
router.use(protect);

// Get dashboard statistics
router.get('/stats', authorize('User', 'Agent', 'Admin'), getDashboardStats);

module.exports = router;
