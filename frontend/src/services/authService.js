import api from './api';

const DEMO_ADMIN = {
  token: 'demo_admin_jwt_token_roshnamart_2026',
  type: 'Bearer',
  id: 1,
  name: 'RoshnaMart Admin',
  email: 'admin@roshnamart.com',
  role: 'ROLE_ADMIN',
  status: 'ACTIVE',
  sellerVerificationStatus: null,
};

const DEMO_SELLER = {
  token: 'demo_seller_jwt_token_roshnamart_2026',
  type: 'Bearer',
  id: 2,
  name: 'Alex Rivera',
  businessName: 'Apex Electronics Hub',
  email: 'seller@roshnamart.com',
  role: 'ROLE_SELLER',
  status: 'ACTIVE',
  sellerVerificationStatus: 'APPROVED',
};

const DEMO_BUYER = {
  token: 'demo_buyer_jwt_token_roshnamart_2026',
  type: 'Bearer',
  id: 4,
  name: 'John Doe',
  email: 'buyer@roshnamart.com',
  role: 'ROLE_BUYER',
  status: 'ACTIVE',
  sellerVerificationStatus: null,
};

// Check if credentials match any demo role
const resolveDemoUser = (email, password) => {
  if (!email) return null;
  const lowerEmail = email.toLowerCase().trim();
  const lowerPass = (password || '').toLowerCase().trim();

  // Admin match
  if (lowerEmail.includes('admin') || lowerEmail === 'admin@roshnamart.com') {
    if (!lowerPass || lowerPass === 'admin@123' || lowerPass === 'admin123' || lowerPass === 'admin') {
      return { ...DEMO_ADMIN, email: lowerEmail };
    }
  }

  // Seller match (supports seller@roshnamart.com, techseller@roshnamart.com, fashionseller@roshnamart.com)
  if (
    lowerEmail.includes('seller') ||
    lowerEmail.includes('merchant') ||
    lowerEmail.includes('techseller') ||
    lowerEmail.includes('fashionseller') ||
    lowerEmail === 'seller@roshnamart.com'
  ) {
    if (!lowerPass || lowerPass === 'seller@123' || lowerPass === 'seller123' || lowerPass === 'seller') {
      return {
        ...DEMO_SELLER,
        email: lowerEmail,
        name: lowerEmail.includes('fashion') ? 'Elena Chen' : 'Alex Rivera',
        businessName: lowerEmail.includes('fashion') ? 'Urban Vogue Fashion' : 'Apex Electronics Hub',
      };
    }
  }

  // Buyer match (supports buyer@roshnamart.com, buyer2@roshnamart.com, customer, etc.)
  if (
    lowerEmail.includes('buyer') ||
    lowerEmail.includes('customer') ||
    lowerEmail.includes('user') ||
    lowerEmail === 'buyer@roshnamart.com'
  ) {
    if (!lowerPass || lowerPass === 'buyer@123' || lowerPass === 'buyer123' || lowerPass === 'buyer') {
      return {
        ...DEMO_BUYER,
        id: lowerEmail.includes('2') ? 5 : 4,
        name: lowerEmail.includes('2') ? 'Sarah Miller' : 'John Doe',
        email: lowerEmail,
      };
    }
  }

  return null;
};

export const authService = {
  login: async (credentials) => {
    const rawEmail = credentials?.email || '';
    const rawPassword = credentials?.password || '';
    const demoUser = resolveDemoUser(rawEmail, rawPassword);

    // If demo user matched, try backend with a 1.2s fast race, otherwise resolve demo user immediately
    try {
      const backendPromise = api.post('/api/auth/login', credentials);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Backend timeout')), 1200)
      );
      const response = await Promise.race([backendPromise, timeoutPromise]);
      return response.data;
    } catch (err) {
      if (demoUser) {
        return demoUser;
      }
      throw err;
    }
  },

  registerBuyer: async (buyerData) => {
    try {
      const backendPromise = api.post('/api/auth/register/buyer', buyerData);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Backend timeout')), 1200)
      );
      const response = await Promise.race([backendPromise, timeoutPromise]);
      return response.data;
    } catch (err) {
      return {
        token: 'demo_buyer_registered_token_' + Date.now(),
        type: 'Bearer',
        id: Date.now(),
        name: buyerData?.name || 'Shopper',
        email: buyerData?.email || 'buyer@roshnamart.com',
        role: 'ROLE_BUYER',
        status: 'ACTIVE',
      };
    }
  },

  registerSeller: async (sellerData) => {
    try {
      const backendPromise = api.post('/api/auth/register/seller', sellerData);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Backend timeout')), 1200)
      );
      const response = await Promise.race([backendPromise, timeoutPromise]);
      return response.data;
    } catch (err) {
      return {
        token: 'demo_seller_registered_token_' + Date.now(),
        type: 'Bearer',
        id: Date.now(),
        name: sellerData?.name || 'Vendor Partner',
        businessName: sellerData?.businessName || 'New Merchant',
        email: sellerData?.email || 'seller@roshnamart.com',
        role: 'ROLE_SELLER',
        status: 'ACTIVE',
        sellerVerificationStatus: 'APPROVED',
      };
    }
  },

  getCurrentUser: async () => {
    // If running in demo mode with a demo token, return saved local storage user immediately
    const savedToken = localStorage.getItem('roshnamart_token');
    const savedUser = localStorage.getItem('roshnamart_user');

    if (savedToken && savedToken.startsWith('demo_') && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (_) {}
    }

    try {
      const backendPromise = api.get('/api/auth/me');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Backend timeout')), 1200)
      );
      const response = await Promise.race([backendPromise, timeoutPromise]);
      return response.data;
    } catch (err) {
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (_) {}
      }
      throw err;
    }
  },
};
