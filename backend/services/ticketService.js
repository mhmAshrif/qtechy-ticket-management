const Ticket = require('../models/Ticket');
const User = require('../models/User');

// Create a new ticket
const createTicket = async (title, description, category, priority, createdBy) => {
  const ticket = await Ticket.create({
    title,
    description,
    category,
    priority,
    createdBy
  });

  await ticket.populate('createdBy', 'name email role');
  return ticket;
};

// Get all tickets with filters
const getTickets = async (filters = {}, pagination = {}) => {
  const { status, priority, category, assignedTo, search, createdBy } = filters;
  const orCriteria = filters.$or;
  const { page = 1, limit = 10 } = pagination;

  let query = {};

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (assignedTo) query.assignedTo = assignedTo;
  if (createdBy) query.createdBy = createdBy;

  const searchQuery = search ? {
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { ticketNumber: { $regex: search, $options: 'i' } }
    ]
  } : null;

  if (orCriteria && searchQuery) {
    query.$and = [{ $or: orCriteria }, searchQuery];
  } else if (orCriteria) {
    query.$or = orCriteria;
  } else if (searchQuery) {
    query.$or = searchQuery.$or;
  }

  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    Ticket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Ticket.countDocuments(query)
  ]);

  return {
    tickets,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    }
  };
};

// Get single ticket by ID
const getTicketById = async (ticketId) => {
  const ticket = await Ticket.findById(ticketId)
    .populate('createdBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .populate('comments.user', 'name email role');

  return ticket;
};

// Update ticket
const updateTicket = async (ticketId, updateData) => {
  const ticket = await Ticket.findByIdAndUpdate(ticketId, updateData, { new: true })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('comments.user', 'name email');

  return ticket;
};

// Add comment to ticket
const addComment = async (ticketId, userId, commentText) => {
  const ticket = await Ticket.findByIdAndUpdate(
    ticketId,
    {
      $push: {
        comments: {
          user: userId,
          text: commentText
        }
      }
    },
    { new: true }
  ).populate('comments.user', 'name email');

  return ticket;
};

// Update ticket status
const updateTicketStatus = async (ticketId, newStatus, userId) => {
  const ticket = await Ticket.findByIdAndUpdate(
    ticketId,
    {
      status: newStatus,
      $push: {
        statusHistory: {
          status: newStatus,
          changedBy: userId
        }
      }
    },
    { new: true }
  ).populate('createdBy', 'name email').populate('assignedTo', 'name email');

  return ticket;
};

// Get dashboard statistics
const getDashboardStats = async () => {
  const [
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    urgentTickets,
    totalUsers,
    agentCount
  ] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: 'Open' }),
    Ticket.countDocuments({ status: 'In Progress' }),
    Ticket.countDocuments({ status: 'Resolved' }),
    Ticket.countDocuments({ status: 'Closed' }),
    Ticket.countDocuments({ priority: 'Urgent' }),
    User.countDocuments(),
    User.countDocuments({ role: 'Agent' })
  ]);

  return {
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    urgentTickets,
    totalUsers,
    agentCount
  };
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment,
  updateTicketStatus,
  getDashboardStats
};
