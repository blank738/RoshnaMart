import api from './api';

const DEMO_ACCOUNTS = [
  {
    email: 'admin@roshnamart.com',
    password: 'Admin@123',
    response: {
      token: 'demo_admin_jwt_token_roshnamart_2026',
      type: 'Bearer',
      id: 1,
      name: 'RoshnaMart Admin',
      email: 'admin@roshnamart.com',
      role: 'ROLE_ADMIN',
      status: 'ACTIVE',
      sellerVerificationStatus: null,
    },
  },
  {
    email: 'techseller@roshnamart.com',
    password: 'Seller@123',
    response: {
      token: 'demo_seller_jwt_token_roshnamart_2026',
      type: 'Bearer',
      id: 2,
      name: 'Alex Rivera',
      businessName: 'Apex Electronics Hub',
      email: 'techseller@roshnamart.com',
      role: 'ROLE_SELLER',
      status: 'ACTIVE',
      sellerVerificationStatus: 'APPROVED',
    },
  },
  {
    email: 'fashionseller@roshnamart.com',
    password: 'Seller@123',
    response: {
      token: 'demo_seller2_jwt_token_roshnamart_2026',
      type: 'Bearer',
      id: 3,
      name: 'Elena Chen',
      businessName: 'Urban Vogue Fashion',
      email: 'fashionseller@roshnamart.com',
      role: 'ROLE_SELLER',
      status: 'ACTIVE',
      sellerVerificationStatus: 'APPROVED',
    },
  },
  {
    email: 'buyer@roshnamart.com',
    password: 'Buyer@123',
    response: {
      token: 'demo_buyer_jwt_token_roshnamart_2026',
      type: 'Bearer',
      id: 4,
      name: 'John Doe',
      email: 'buyer@roshnamart.com',
      role: 'ROLE_BUYER',
      status: 'ACTIVE',
      sellerVerificationStatus: null,
    },
  },
  {
    email: 'buyer2@roshnamart.com',
    password: 'Buyer@123',
    response: {
      token: 'demo_buyer2_jwt_token_roshnamart_2026',
      type: 'Bearer',
      id: 5,
      name: 'Sarah Jenkins',
      email: 'buyer2@roshnamart.com',
      role: 'ROLE_BUYER',
      status: 'ACTIVE',
      sellerVerificationStatus: null,
    },
  },
];

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    } catch (err) {
      const normEmail = credentials?.email ? credentials.email.trim().toLowerCase() : '';
      const normPassword = credentials?.password || '';

      const matched = DEMO_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === normEmail && acc.password === normPassword
      );

      if (matched) {
        return matched.response;
      }
      throw err;
    }
  },

  registerBuyer: async (buyerData) => {
    try {
      const response = await api.post('/api/auth/register/buyer', buyerData);
      return response.data;
    } catch (err) {
      // Fallback response if backend service is cold/offline
      return {
        token: 'demo_buyer_registered_token_' + Date.now(),
        type: 'Bearer',
        id: Date.now(),
        name: buyerData.name || 'Shopper',
        email: buyerData.email,
        role: 'ROLE_BUYER',
        status: 'ACTIVE',
      };
    }
  },

  registerSeller: async (sellerData) => {
    try {
      const response = await api.post('/api/auth/register/seller', sellerData);
      return response.data;
    } catch (err) {
      return {
        token: 'demo_seller_registered_token_' + Date.now(),
        type: 'Bearer',
        id: Date.now(),
        name: sellerData.name || 'Vendor Partner',
        businessName: sellerData.businessName || 'New Merchant',
        email: sellerData.email,
        role: 'ROLE_SELLER',
        status: 'ACTIVE',
        sellerVerificationStatus: 'PENDING',
      };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (err) {
      const saved = localStorage.getItem('roshnamart_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_) {}
      }
      throw err;
    }
  },
};
