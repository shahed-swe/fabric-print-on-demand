import api from '../config/axios';

export const guestAuthService = {
  // Create a guest account with temporary password
  createGuestAccount: async (email: string) => {
    try {
      const response = await api.post('/auth/create-guest-account', {
        email
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
