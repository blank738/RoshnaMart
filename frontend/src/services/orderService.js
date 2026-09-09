import api from './api';

export const orderService = {
  checkout: async (checkoutData) => {
    const response = await api.post('/api/buyer/checkout', checkoutData);
    return response.data;
  },

  getBuyerOrders: async (page = 0, size = 10) => {
    const response = await api.get('/api/buyer/orders', { params: { page, size } });
    return response.data;
  },

  getBuyerOrderById: async (id) => {
    const response = await api.get(`/api/buyer/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await api.post(`/api/buyer/orders/${id}/cancel`);
    return response.data;
  },

  buyAgain: async (id) => {
    const response = await api.post(`/api/buyer/orders/${id}/buy-again`);
    return response.data;
  },

  requestReturn: async (returnData) => {
    const response = await api.post('/api/buyer/orders/return', returnData);
    return response.data;
  },

  // Addresses
  getAddresses: async () => {
    const response = await api.get('/api/buyer/addresses');
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await api.post('/api/buyer/addresses', addressData);
    return response.data;
  },

  updateAddress: async (id, addressData) => {
    const response = await api.put(`/api/buyer/addresses/${id}`, addressData);
    return response.data;
  },

  deleteAddress: async (id) => {
    const response = await api.delete(`/api/buyer/addresses/${id}`);
    return response.data;
  },

  setDefaultAddress: async (id) => {
    const response = await api.patch(`/api/buyer/addresses/${id}/default`);
    return response.data;
  },

  // Wishlist
  getWishlist: async () => {
    const response = await api.get('/api/buyer/wishlist');
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await api.post(`/api/buyer/wishlist/${productId}`);
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/api/buyer/wishlist/${productId}`);
    return response.data;
  },

  moveToCart: async (productId) => {
    const response = await api.post(`/api/buyer/wishlist/${productId}/move-to-cart`);
    return response.data;
  },

  // Reviews
  addReview: async (reviewData) => {
    const response = await api.post('/api/buyer/reviews', reviewData);
    return response.data;
  },

  checkReviewEligibility: async (productId) => {
    const response = await api.get(`/api/buyer/reviews/eligible/${productId}`);
    return response.data;
  },

  // Notifications
  getNotifications: async (page = 0, size = 15) => {
    const response = await api.get('/api/buyer/notifications', { params: { page, size } });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/api/buyer/notifications/unread-count');
    return response.data;
  },

  markNotificationAsRead: async (id) => {
    const response = await api.patch(`/api/buyer/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await api.patch('/api/buyer/notifications/read-all');
    return response.data;
  },
};
