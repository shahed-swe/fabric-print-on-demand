import axios from '../config/axios';

export const productService = {
  async getAllProducts(params?: any) {
    try {
      const response = await axios.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductsByCategory(categorySlug: string, params?: any) {
    try {
      const response = await axios.get(`/products/category/${categorySlug}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  async getProductById(id: string) {
    try {
      const response = await axios.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Alias for getProductById
  async getProduct(id: string) {
    return this.getProductById(id);
  },

  async getFeaturedProducts() {
    try {
      const response = await axios.get('/products/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }
};
