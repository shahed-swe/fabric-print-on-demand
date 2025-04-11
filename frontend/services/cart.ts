import api from '../config/axios';

export const cartService = {
  getCartItems: async (userId: string) => {
    const response = await api.get('/cart', {
      params: { userId }
    });
    return response.data;
  },

  removeFromCart: async (itemId: string) => {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },

  removeByUserId: async (userId: string) => {
    const response = await api.delete(`/cart/user/${userId}`);
    return response.data;
  },
};
