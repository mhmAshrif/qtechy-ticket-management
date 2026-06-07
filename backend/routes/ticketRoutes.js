const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  addComment,
  updateTicketStatus,
  assignTicket
} = require('../controllers/ticketController');

const router = express.Router();

// All ticket routes require authentication
router.use(protect);

// Get all tickets
router.get('/', getAllTickets);

// Get single ticket
router.get('/:ticketId', getTicketById);

// Create ticket (Users can create their own tickets)
router.post('/', authorize('User', 'Admin'), createTicket);

// Update ticket (Creator or Admin can update)
router.put('/:ticketId', authorize('User', 'Agent', 'Admin'), updateTicket);

// Delete ticket (Admin only)
router.delete('/:ticketId', authorize('Admin'), deleteTicket);

// Add comment to ticket
router.post('/:ticketId/comments', addComment);

// Update ticket status (Agent and Admin can update status)
router.patch('/:ticketId/status', authorize('Agent', 'Admin'), updateTicketStatus);

// Assign ticket (Admin only)
router.patch('/:ticketId/assign', authorize('Admin'), assignTicket);

module.exports = router;
