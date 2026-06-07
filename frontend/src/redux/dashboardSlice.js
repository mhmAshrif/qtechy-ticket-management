import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: {
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    urgentTickets: 0,
    totalUsers: 0,
    agentCount: 0
  },
  loading: false,
  error: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    fetchStatsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStatsSuccess: (state, action) => {
      state.loading = false;
      state.stats = action.payload;
      state.error = null;
    },
    fetchStatsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure,
  clearError
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
