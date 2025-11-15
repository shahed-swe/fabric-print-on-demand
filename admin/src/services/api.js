import axiosInstance from '../config/axios';

// Products API
export const productApi = {
  getAll: () => axiosInstance.get('/admin/products'),
  getById: (id) => axiosInstance.get(`/admin/products/${id}`),
  create: (data) => axiosInstance.post('/admin/products', data),
  update: (id, data) => axiosInstance.put(`/admin/products/${id}`, data),
  delete: (id) => axiosInstance.delete(`/admin/products/${id}`),
};

// Orders API
export const orderApi = {
  getAll: () => axiosInstance.get('/admin/orders'),
  getById: (id) => axiosInstance.get(`/admin/orders/${id}`),
  updateStatus: (id, status) => axiosInstance.patch(`/admin/orders/${id}/status`, { status }),
};

// Customers API
export const customerApi = {
  getAll: (params) => axiosInstance.get('/admin/customers', { params }),
  getById: (id) => axiosInstance.get(`/admin/customers/${id}`),
};

// Categories API
export const categoryApi = {
  getAll: () => axiosInstance.get('/admin/categories'),
  getById: (id) => axiosInstance.get(`/admin/categories/${id}`),
  create: (data) => axiosInstance.post('/admin/categories', data),
  update: (id, data) => axiosInstance.put(`/admin/categories/${id}`, data),
  delete: (id) => axiosInstance.delete(`/admin/categories/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => axiosInstance.get('/admin/dashboard/stats'),
  getSalesData: (period) => axiosInstance.get(`/admin/dashboard/sales?period=${period}`),
};

// Authentication API
export const authApi = {
  login: (credentials) => axiosInstance.post('/admin/auth/login', credentials),
  validateToken: () => axiosInstance.get('/admin/validate-token'),
};

// Designs API
export const designApi = {
  getAll: () => axiosInstance.get('/admin/designs'),
  getById: (id) => axiosInstance.get(`/admin/designs/${id}`),
  approve: (id) => axiosInstance.patch(`/admin/designs/${id}/approve`),
  reject: (id, reason) => axiosInstance.patch(`/admin/designs/${id}/reject`, { reason }),
};
