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
      .populate('comments.user', 'name email role')
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
const getDashboardStats = async ({ userId, userRole }) => {
  const isAdmin = userRole === 'Admin';
  const isAgent = userRole === 'Agent';

  const scopeQuery = isAdmin
    ? {}
    : isAgent
      ? { assignedTo: userId }
      : { createdBy: userId };

  const [
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    urgentTickets
  ] = await Promise.all([
    Ticket.countDocuments(scopeQuery),
    Ticket.countDocuments({ ...scopeQuery, status: 'Open' }),
    Ticket.countDocuments({ ...scopeQuery, status: 'In Progress' }),
    Ticket.countDocuments({ ...scopeQuery, status: 'Resolved' }),
    Ticket.countDocuments({ ...scopeQuery, status: 'Closed' }),
    Ticket.countDocuments({ ...scopeQuery, priority: 'Urgent' })
  ]);

  const [totalUsers, agentCount] = isAdmin
    ? await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'Agent' })
      ])
    : [0, 0];

  const ticketsByStatus = await Ticket.aggregate([
    { $match: scopeQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const ticketsByCategory = await Ticket.aggregate([
    { $match: scopeQuery },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  const agentWorkload = isAdmin
    ? await (async () => {
        const agents = await User.find({ role: 'Agent' }).select('name').lean();
        const openTicketsByAgent = await Ticket.aggregate([
          {
            $match: {
              status: 'Open',
              assignedTo: { $ne: null }
            }
          },
          {
            $group: {
              _id: '$assignedTo',
              openCount: { $sum: 1 }
            }
          }
        ]);

        const agentOpenCountMap = new Map(openTicketsByAgent.map(item => [item._id.toString(), item.openCount]));
        return agents.map(agent => ({
          agentId: agent._id,
          agentName: agent.name,
          openCount: agentOpenCountMap.get(agent._id.toString()) || 0
        }));
      })()
    : isAgent
      ? [{
          agentId: userId,
          agentName: 'You',
          openCount: openTickets
        }]
      : [];

  const recentCreated = await Ticket.find(scopeQuery)
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('createdBy', 'name role')
    .select('ticketNumber title createdBy createdAt')
    .lean();

  const recentStatusUpdates = await Ticket.aggregate([
    { $match: scopeQuery },
    { $unwind: '$statusHistory' },
    { $sort: { 'statusHistory.changedAt': -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: 'statusHistory.changedBy',
        foreignField: '_id',
        as: 'changedBy'
      }
    },
    { $unwind: { path: '$changedBy', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        ticketNumber: 1,
        status: '$statusHistory.status',
        changedAt: '$statusHistory.changedAt',
        changedByName: '$changedBy.name',
        changedByRole: '$changedBy.role'
      }
    }
  ]);

  const createdEvents = recentCreated.map(ticket => ({
    date: ticket.createdAt,
    text: `${ticket.createdBy?.name || 'User'} created a new ticket ${ticket.ticketNumber}`
  }));

  const statusEvents = recentStatusUpdates.map(update => {
    const statusLabel = update.status === 'Resolved'
      ? 'resolved'
      : update.status === 'Closed'
      ? 'closed'
      : update.status === 'In Progress'
      ? 'moved to In Progress'
      : `changed to ${update.status}`;

    return {
      date: update.changedAt,
      text: `${update.changedByName || 'User'} ${statusLabel} ${update.ticketNumber}`
    };
  });

  const recentActivity = [...createdEvents, ...statusEvents]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return {
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    urgentTickets,
    totalUsers,
    agentCount,
    ticketsByStatus: ticketsByStatus.map(item => ({ status: item._id, count: item.count })),
    ticketsByCategory: ticketsByCategory.map(item => ({ category: item._id, count: item.count })),
    agentWorkload,
    recentActivity
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
