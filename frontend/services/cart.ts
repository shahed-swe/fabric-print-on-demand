import api from '../config/axios';

export const cartService = {
  getCartItems: async (userId: string) => {
    const response = await api.get('/cart', {
      params: { userId }
    });
    return response.data;
  },

  addToCart: async (productId: string, quantity: number, size?: string, color?: string) => {
    const response = await api.post('/cart', {
      productId,
      quantity,
      size,
      color
    });
    return response.data;
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    const response = await api.put(`/cart/${itemId}`, { quantity });
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
