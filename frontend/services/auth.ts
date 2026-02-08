import api from '../config/axios';

// Error message mapping for user-friendly responses
const getErrorMessage = (error: any): string => {
  // If error response has a message from the server, use it
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Handle specific status codes
  if (error.response?.status === 400) {
    return 'Invalid email or password. Please check your credentials.';
  }
  
  if (error.response?.status === 401) {
    return 'Invalid email or password. Please try again.';
  }
  
  if (error.response?.status === 409) {
    return 'This email is already registered. Please use a different email or login instead.';
  }
  
  if (error.response?.status === 500) {
    return 'Server error. Please try again later.';
  }
  
  // Fallback error message
  return error.message || 'An error occurred. Please try again.';
};

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  },

  register: async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};
