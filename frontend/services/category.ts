import axios from '../config/axios';

export const categoryService = {
  async getCategories() {
    try {
      const response = await axios.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getCategoryBySlug(slug: string) {
    try {
      const response = await axios.get(`/categories/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }
};
