import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  agents: [],
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    fetchUsersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action) => {
      state.loading = false;
      state.users = action.payload;
      state.error = null;
    },
    fetchUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchAgentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAgentsSuccess: (state, action) => {
      state.loading = false;
      state.agents = action.payload;
      state.error = null;
    },
    fetchAgentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess: (state, action) => {
      state.loading = false;
      const index = state.users.findIndex(u => u._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
      state.error = null;
    },
    updateUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteUserSuccess: (state, action) => {
      state.loading = false;
      state.users = state.users.filter(u => u._id !== action.payload);
      state.error = null;
    },
    deleteUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchAgentsStart,
  fetchAgentsSuccess,
  fetchAgentsFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  clearError
} = userSlice.actions;

export default userSlice.reducer;
