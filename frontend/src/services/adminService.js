import api from './api';

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  },

  getSellers: async (params = {}) => {
    const response = await api.get('/api/admin/sellers', { params });
    return response.data;
  },

  approveSeller: async (id) => {
    const response = await api.put(`/api/admin/sellers/${id}/approve`);
    return response.data;
  },

  rejectSeller: async (id) => {
    const response = await api.put(`/api/admin/sellers/${id}/reject`);
    return response.data;
  },

  suspendSeller: async (id) => {
    const response = await api.put(`/api/admin/sellers/${id}/suspend`);
    return response.data;
  },

  reactivateSeller: async (id) => {
    const response = await api.put(`/api/admin/sellers/${id}/reactivate`);
    return response.data;
  },

  getBuyers: async (page = 0, size = 10) => {
    const response = await api.get('/api/admin/buyers', { params: { page, size } });
    return response.data;
  },

  updateUserStatus: async (id, status) => {
    const response = await api.put(`/api/admin/users/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  getProducts: async (params = {}) => {
    const response = await api.get('/api/admin/products', { params });
    return response.data;
  },

  updateProductStatus: async (id, status) => {
    const response = await api.put(`/api/admin/products/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  getOrders: async (page = 0, size = 10) => {
    const response = await api.get('/api/admin/orders', { params: { page, size } });
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/api/admin/orders/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  getReturns: async (params = {}) => {
    const response = await api.get('/api/admin/returns', { params });
    return response.data;
  },

  processReturn: async (id, status) => {
    const response = await api.patch(`/api/admin/returns/${id}/process`, null, {
      params: { status },
    });
    return response.data;
  },

  getCoupons: async () => {
    const response = await api.get('/api/admin/coupons');
    return response.data;
  },

  createCoupon: async (couponData) => {
    const response = await api.post('/api/admin/coupons', couponData);
    return response.data;
  },

  updateCouponStatus: async (id, status) => {
    const response = await api.patch(`/api/admin/coupons/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/api/admin/settings');
    return response.data;
  },

  updateSettings: async (settingsData) => {
    const response = await api.put('/api/admin/settings', settingsData);
    return response.data;
  },

  getAuditLogs: async (page = 0, size = 20) => {
    const response = await api.get('/api/admin/audit-logs', { params: { page, size } });
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/api/admin/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/api/admin/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/api/admin/categories/${id}`);
    return response.data;
  },
};
