const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const { getDashboardStats } = require('../controllers/dashboardController');

const router = express.Router();

// Dashboard routes require authentication
router.use(protect);

// Get dashboard statistics (Admin and Agent only)
router.get('/stats', authorize('Admin', 'Agent'), getDashboardStats);

module.exports = router;
