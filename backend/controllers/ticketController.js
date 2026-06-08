const Ticket = require('../models/Ticket');
const ticketService = require('../services/ticketService');

// Create new ticket
const createTicket = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    // Validation
    if (!title || !description || !category || !priority) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const ticket = await ticketService.createTicket(title, description, category, priority, req.userId);

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tickets
const getAllTickets = async (req, res) => {
  try {
    const { status, priority, category, assignedTo, search, page, limit } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;
    if (assignedTo) filters.assignedTo = assignedTo;
    if (search) filters.search = search;

    // Non-admin users can only see their own tickets or tickets assigned to them
    if (req.userRole !== 'Admin') {
      if (req.userRole === 'Agent') {
        filters.$or = [
          { createdBy: req.userId },
          { assignedTo: req.userId }
        ];
      } else {
        filters.createdBy = req.userId;
      }
    }

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    };

    const result = await ticketService.getTickets(filters, pagination);

    res.status(200).json({
      success: true,
      data: result.tickets,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single ticket
const getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await ticketService.getTicketById(ticketId);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Non-admin users can only view their own tickets or assigned tickets
    if (req.userRole !== 'Admin') {
      const ownerId = ticket.createdBy?._id?.toString() || ticket.createdBy?.toString();
      const assignedId = ticket.assignedTo?._id?.toString() || ticket.assignedTo?.toString();
      const userId = req.userId.toString();

      const isOwner = ownerId === userId;
      const isAssigned = assignedId === userId;

      if (!isOwner && !isAssigned) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
      }
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update ticket
const updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { title, description, category, priority } = req.body;

    // Check if ticket exists and user has permission
    const ticket = await ticketService.getTicketById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Non-admin users can only update their own tickets
    if (req.userRole !== 'Admin') {
      const ownerId = ticket.createdBy?._id?.toString() || ticket.createdBy?.toString();
      const userId = req.userId.toString();
      const isOwner = ownerId === userId;

      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this ticket' });
      }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (priority) updateData.priority = priority;

    const updatedTicket = await ticketService.updateTicket(ticketId, updateData);

    res.status(200).json({
      success: true,
      data: updatedTicket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete ticket
const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Non-admin users can only delete their own tickets
    if (req.userRole !== 'Admin') {
      const isOwner = ticket.createdBy.toString() === req.userId.toString();
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this ticket' });
      }
    }

    await Ticket.findByIdAndDelete(ticketId);

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add comment to ticket
const addComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const ticket = await ticketService.addComment(ticketId, req.userId, text);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update ticket status
const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const ticket = await ticketService.updateTicketStatus(ticketId, status, req.userId);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign ticket to agent/user
const assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ success: false, message: 'AssignedTo user ID is required' });
    }

    const ticket = await ticketService.updateTicket(ticketId, { assignedTo });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  addComment,
  updateTicketStatus,
  assignTicket
};
