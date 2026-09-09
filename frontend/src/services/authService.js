import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  registerBuyer: async (buyerData) => {
    const response = await api.post('/api/auth/register/buyer', buyerData);
    return response.data;
  },

  registerSeller: async (sellerData) => {
    const response = await api.post('/api/auth/register/seller', sellerData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};
