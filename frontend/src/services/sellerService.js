import api from './api';

export const sellerService = {
  getDashboard: async () => {
    const response = await api.get('/api/seller/dashboard');
    return response.data;
  },

  getProducts: async (page = 0, size = 10) => {
    const response = await api.get('/api/seller/products', { params: { page, size } });
    return response.data;
  },

  getProductDetails: async (id) => {
    const response = await api.get(`/api/seller/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/api/seller/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/api/seller/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/api/seller/products/${id}`);
    return response.data;
  },

  updateStock: async (id, quantity) => {
    const response = await api.patch(`/api/seller/products/${id}/stock`, null, {
      params: { quantity },
    });
    return response.data;
  },

  getOrders: async (page = 0, size = 10) => {
    const response = await api.get('/api/seller/orders', { params: { page, size } });
    return response.data;
  },

  updateOrderItemStatus: async (orderItemId, status) => {
    const response = await api.patch(`/api/seller/orders/items/${orderItemId}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/seller/profile');
    return response.data;
  },

  getNotifications: async (page = 0, size = 15) => {
    const response = await api.get('/api/seller/notifications', { params: { page, size } });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/api/seller/notifications/unread-count');
    return response.data;
  },

  markNotificationAsRead: async (id) => {
    const response = await api.patch(`/api/seller/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await api.patch('/api/seller/notifications/read-all');
    return response.data;
  },

  uploadImage: async (formData) => {
    const response = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
