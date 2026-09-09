import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  getFeaturedProducts: async () => {
    const response = await api.get('/api/products/featured');
    return response.data;
  },

  getDiscountedProducts: async () => {
    const response = await api.get('/api/products/discounted');
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },

  getProductReviews: async (productId) => {
    const response = await api.get(`/api/products/${productId}/reviews`);
    return response.data;
  },

  getMarketplaceSettings: async () => {
    const response = await api.get('/api/settings');
    return response.data;
  },
};
