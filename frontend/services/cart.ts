import api from '../config/axios';

export const cartService = {
  getCartItems: async (userId: string) => {
    const response = await api.get('/cart', {
      params: { userId }
    });
    return response.data;
  },

  addToCart: async (
    userId: string,
    itemType: 'product' | 'design',
    itemId: string,
    quantity: number,
    price: number,
    size?: string,
    color?: string
  ) => {
    const payload: any = {
      userId,
      itemType,
      quantity,
      price
    };

    if (itemType === 'product') {
      payload.productId = itemId;
      if (size) payload.size = size;
      if (color) payload.color = color;
    } else {
      payload.designId = itemId;
    }

    const response = await api.post('/cart', payload);
    return response.data;
  },

  updateCartItem: async (itemId: string, quantity: number, userId: string) => {
    const response = await api.put(`/cart/${itemId}`, { quantity, userId });
    return response.data;
  },

  updateDesignSizes: async (itemId: string, sizeQuantities: Record<string, number>, userId: string) => {
    const response = await api.put(`/cart/design/${itemId}/sizes`, { sizeQuantities, userId });
    return response.data;
  },

  removeFromCart: async (itemId: string, userId: string) => {
    const response = await api.delete(`/cart/${itemId}`, {
      params: { userId }
    });
    return response.data;
  },

  removeByUserId: async (userId: string) => {
    const response = await api.delete(`/cart/user/${userId}`);
    return response.data;
  },
};
