import axiosInstance from './axiosInstance';

export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Registration failed',
    };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Login failed',
    };
  }
};
