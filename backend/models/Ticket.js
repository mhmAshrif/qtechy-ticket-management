const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Bug', 'Feature Request', 'Technical Issue', 'Payment Issue', 'Account Issue', 'Other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  statusHistory: [
    {
      status: String,
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      changedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

// Auto-generate ticket number before validation so required check passes
ticketSchema.pre('validate', async function () {
  if (this.isNew && !this.ticketNumber) {
    try {
      if (mongoose.connection.readyState === 1) {
        const lastTicket = await mongoose.model('Ticket').findOne().sort({ createdAt: -1 });
        const number = lastTicket ? parseInt(lastTicket.ticketNumber.split('-')[1]) + 1 : 1;
        this.ticketNumber = `TKT-${String(number).padStart(4, '0')}`;
      } else {
        this.ticketNumber = 'TKT-0001';
      }
    } catch (error) {
      console.warn('Error generating ticket number:', error.message);
      this.ticketNumber = 'TKT-0001';
    }
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);
