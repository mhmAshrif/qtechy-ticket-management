import axiosInstance from './axiosInstance';

export const createTicket = async (ticketData) => {
  const response = await axiosInstance.post('/tickets', ticketData);
  return response.data;
};

export const getTickets = async (params) => {
  const response = await axiosInstance.get('/tickets', { params });
  return response.data;
};

export const getTicketById = async (ticketId) => {
  const response = await axiosInstance.get(`/tickets/${ticketId}`);
  return response.data;
};

export const updateTicket = async (ticketId, ticketData) => {
  const response = await axiosInstance.put(`/tickets/${ticketId}`, ticketData);
  return response.data;
};

export const deleteTicket = async (ticketId) => {
  const response = await axiosInstance.delete(`/tickets/${ticketId}`);
  return response.data;
};

export const addComment = async (ticketId, commentData) => {
  const response = await axiosInstance.post(`/tickets/${ticketId}/comments`, commentData);
  return response.data;
};

export const updateTicketStatus = async (ticketId, statusData) => {
  const response = await axiosInstance.patch(`/tickets/${ticketId}/status`, statusData);
  return response.data;
};

export const assignTicket = async (ticketId, assignmentData) => {
  const response = await axiosInstance.patch(`/tickets/${ticketId}/assign`, assignmentData);
  return response.data;
};
