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
    console.log('Auth service - resetPassword called with token:', token?.substring(0, 20) + '...');
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
      confirmPassword
    });
    console.log('Auth service - Response:', response.data);
    return response.data;
  },

  validateResetToken: async (token: string) => {
    console.log('Auth service - validateResetToken called with token:', token?.substring(0, 20) + '...');
    const response = await api.post('/auth/validate-reset-token', { token });
    console.log('Auth service - Token validation response:', response.data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};
