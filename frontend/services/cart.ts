import api from '../config/axios';

export const cartService = {
  getCartItems: async (userId: string) => {
    const response = await api.get('/cart', {
      params: { userId }
    });
    return response.data;
  },

  addToCart: async (item: any) => {
    const response = await api.post('/cart', item);
    return response.data;
  },

  removeFromCart: async (itemId: string) => {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  }
};
