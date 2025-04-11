import axiosInstance from '../config/axios';

// Products API
export const productApi = {
  getAll: () => axiosInstance.get('/api/admin/products'),
  getById: (id) => axiosInstance.get(`/api/admin/products/${id}`),
  create: (data) => axiosInstance.post('/api/admin/products', data),
  update: (id, data) => axiosInstance.put(`/api/admin/products/${id}`, data),
  delete: (id) => axiosInstance.delete(`/api/admin/products/${id}`),
};

// Orders API
export const orderApi = {
  getAll: () => axiosInstance.get('/api/admin/orders'),
  getById: (id) => axiosInstance.get(`/api/admin/orders/${id}`),
  updateStatus: (id, status) => axiosInstance.patch(`/api/admin/orders/${id}/status`, { status }),
};

// Customers API
export const customerApi = {
  getAll: () => axiosInstance.get('/api/admin/customers'),
  getById: (id) => axiosInstance.get(`/api/admin/customers/${id}`),
};

// Categories API
export const categoryApi = {
  getAll: () => axiosInstance.get('/api/admin/categories'),
  getById: (id) => axiosInstance.get(`/api/admin/categories/${id}`),
  create: (data) => axiosInstance.post('/api/admin/categories', data),
  update: (id, data) => axiosInstance.put(`/api/admin/categories/${id}`, data),
  delete: (id) => axiosInstance.delete(`/api/admin/categories/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => axiosInstance.get('/api/admin/dashboard/stats'),
  getSalesData: (period) => axiosInstance.get(`/api/admin/dashboard/sales?period=${period}`),
};

// Authentication API
export const authApi = {
  login: (credentials) => axiosInstance.post('/api/admin/login', credentials),
  validateToken: () => axiosInstance.get('/api/admin/validate-token'),
};

// Designs API
export const designApi = {
  getAll: () => axiosInstance.get('/api/admin/designs'),
  getById: (id) => axiosInstance.get(`/api/admin/designs/${id}`),
  approve: (id) => axiosInstance.patch(`/api/admin/designs/${id}/approve`),
  reject: (id, reason) => axiosInstance.patch(`/api/admin/designs/${id}/reject`, { reason }),
};
