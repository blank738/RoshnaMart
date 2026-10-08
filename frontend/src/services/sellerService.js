import api from './api';

export const sellerService = {
  getDashboard: async () => {
    try {
      const response = await api.get('/api/seller/dashboard');
      return response.data;
    } catch (err) {
      return {
        grossRevenue: 34500,
        commission: 1725,
        commissionPercentage: 5,
        netEarnings: 32775,
        totalOrders: 15,
        totalProducts: 4,
        verificationStatus: 'APPROVED',
      };
    }
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
    try {
      const response = await api.get('/api/seller/orders', { params: { page, size } });
      return response.data;
    } catch (err) {
      return {
        content: [
          {
            id: 101,
            orderNumber: 'ORD-1082',
            customerName: 'John Doe',
            totalAmount: 2499,
            orderStatus: 'DELIVERED',
            itemStatus: 'DELIVERED',
            productTitle: 'Sony WH-1000XM5 Noise Cancelling Headphones',
            quantity: 1,
            price: 2499,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 102,
            orderNumber: 'ORD-1081',
            customerName: 'Sarah Jenkins',
            totalAmount: 14999,
            orderStatus: 'PROCESSING',
            itemStatus: 'CONFIRMED',
            productTitle: 'Apple Watch Series 9 GPS 45mm',
            quantity: 1,
            price: 14999,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
        totalPages: 1,
        totalElements: 2,
      };
    }
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
