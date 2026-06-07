import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  filters: {
    status: null,
    priority: null,
    category: null,
    search: null
  }
};

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    fetchTicketsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTicketsSuccess: (state, action) => {
      state.loading = false;
      state.tickets = action.payload.tickets;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchTicketsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchTicketStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTicketSuccess: (state, action) => {
      state.loading = false;
      state.currentTicket = action.payload;
      state.error = null;
    },
    fetchTicketFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createTicketStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createTicketSuccess: (state, action) => {
      state.loading = false;
      state.tickets.unshift(action.payload);
      state.error = null;
    },
    createTicketFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateTicketStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateTicketSuccess: (state, action) => {
      state.loading = false;
      const index = state.tickets.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
      state.currentTicket = action.payload;
      state.error = null;
    },
    updateTicketFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteTicketStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteTicketSuccess: (state, action) => {
      state.loading = false;
      state.tickets = state.tickets.filter(t => t._id !== action.payload);
      state.error = null;
    },
    deleteTicketFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addCommentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addCommentSuccess: (state, action) => {
      state.loading = false;
      state.currentTicket = action.payload;
      state.error = null;
    },
    addCommentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStatusStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateStatusSuccess: (state, action) => {
      state.loading = false;
      const index = state.tickets.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
      state.currentTicket = action.payload;
      state.error = null;
    },
    updateStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  fetchTicketsStart,
  fetchTicketsSuccess,
  fetchTicketsFailure,
  fetchTicketStart,
  fetchTicketSuccess,
  fetchTicketFailure,
  createTicketStart,
  createTicketSuccess,
  createTicketFailure,
  updateTicketStart,
  updateTicketSuccess,
  updateTicketFailure,
  deleteTicketStart,
  deleteTicketSuccess,
  deleteTicketFailure,
  addCommentStart,
  addCommentSuccess,
  addCommentFailure,
  updateStatusStart,
  updateStatusSuccess,
  updateStatusFailure,
  setFilters,
  clearError
} = ticketSlice.actions;

export default ticketSlice.reducer;
