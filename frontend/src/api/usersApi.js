import axiosInstance from './axiosInstance';

export const getAllUsers = async (params) => {
  const response = await axiosInstance.get('/users', { params });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

export const getAgents = async () => {
  const response = await axiosInstance.get('/users/agents');
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await axiosInstance.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/users/${userId}`);
  return response.data;
};
