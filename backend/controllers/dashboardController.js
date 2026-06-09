const ticketService = require('../services/ticketService');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const stats = await ticketService.getDashboardStats({
      userId: req.userId,
      userRole: req.userRole
    });

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
