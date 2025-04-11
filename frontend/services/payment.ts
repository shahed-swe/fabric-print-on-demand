import api from '../config/axios';

export const paymentService = {
  createPaymentIntent: async (amount: number) => {
    const response = await api.post('/payment/create-intent', { amount });
    return response.data;
  }
};
