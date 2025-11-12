import api from '../config/axios';

export const orderService = {
  createOrder: async (orderData: {
    userId: string;
    items: any[];
    shippingAddress: any;
    paymentStatus: string;
    status?: string;
    totalAmount: number;
  }) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await api.put(`/orders/${orderId}`, { status });
    return response.data;
  }
};
