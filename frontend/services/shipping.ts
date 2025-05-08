import api from '../config/axios';

interface AddressData {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  country?: string;
  userId?: string;
}

export const shippingService = {
  getAddresses: async (userId: string) => {
    const response = await api.get(`/shipping`, {
      params: { userId }
    });
    return response.data;
  },

  addAddress: async (addressData: AddressData) => {
    console.log('Adding address:', addressData);
    const response = await api.post('/shipping', {
      ...addressData,
      country: addressData.country || 'US'
    });
    return response.data;
  }
};
