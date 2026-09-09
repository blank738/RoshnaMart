import api from './api';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/api/buyer/cart');
    return response.data;
  },

  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/api/buyer/cart/items', { productId, quantity });
    return response.data;
  },

  updateCartItem: async (itemId, quantity) => {
    const response = await api.put(`/api/buyer/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId) => {
    const response = await api.delete(`/api/buyer/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/api/buyer/cart');
    return response.data;
  },

  validateCoupon: async (code, amount) => {
    const response = await api.get('/api/buyer/coupons/validate', {
      params: { code, amount },
    });
    return response.data;
  },
};
