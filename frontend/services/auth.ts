import api from '../config/axios';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string, confirmPassword: string) => {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
      confirmPassword
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};
