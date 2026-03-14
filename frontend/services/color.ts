import axios from '../config/axios';

export const colorService = {
  // Get all colors
  getAllColors: async (sortBy = 'sortOrder') => {
    try {
      const response = await axios.get('/colors', {
        params: { sortBy }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching colors:', error);
      throw error;
    }
  },

  // Get single color
  getColor: async (id) => {
    try {
      const response = await axios.get(`/colors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching color:', error);
      throw error;
    }
  }
};
