import axios from '../config/axios';

export const customStyleService = {
  // Get all custom styles
  getAllCustomStyles: async (sortBy = 'sortOrder') => {
    try {
      const response = await axios.get('/custom-styles', {
        params: { sortBy }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching custom styles:', error);
      throw error;
    }
  },

  // Get single custom style
  getCustomStyle: async (id) => {
    try {
      const response = await axios.get(`/custom-styles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching custom style:', error);
      throw error;
    }
  }
};
