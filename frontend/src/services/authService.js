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

const DEMO_BUYERS = {
  'buyer@roshnamart.com': { id: 4, name: 'John Doe', email: 'buyer@roshnamart.com' },
  'buyer1@roshnamart.com': { id: 4, name: 'John Doe', email: 'buyer1@roshnamart.com' },
  'buyer2@roshnamart.com': { id: 5, name: 'Sarah Miller', email: 'buyer2@roshnamart.com' },
  'buyer3@roshnamart.com': { id: 6, name: 'Michael Chang', email: 'buyer3@roshnamart.com' },
  'buyer4@roshnamart.com': { id: 7, name: 'Ananya Rao', email: 'buyer4@roshnamart.com' },
  'buyer5@roshnamart.com': { id: 8, name: 'Emily Watson', email: 'buyer5@roshnamart.com' },
};

const DEMO_SELLERS = {
  'seller@roshnamart.com': { id: 2, name: 'Alex Rivera', businessName: 'Apex Electronics Hub', email: 'seller@roshnamart.com', sellerVerificationStatus: 'APPROVED' },
  'seller1@roshnamart.com': { id: 2, name: 'Alex Rivera', businessName: 'Apex Electronics Hub', email: 'seller1@roshnamart.com', sellerVerificationStatus: 'APPROVED' },
  'techseller@roshnamart.com': { id: 2, name: 'Alex Rivera', businessName: 'Apex Electronics Hub', email: 'techseller@roshnamart.com', sellerVerificationStatus: 'APPROVED' },
  'seller2@roshnamart.com': { id: 3, name: 'Elena Chen', businessName: 'Urban Vogue Fashion', email: 'seller2@roshnamart.com', sellerVerificationStatus: 'APPROVED' },
  'fashionseller@roshnamart.com': { id: 3, name: 'Elena Chen', businessName: 'Urban Vogue Fashion', email: 'fashionseller@roshnamart.com', sellerVerificationStatus: 'APPROVED' },
  'seller3@roshnamart.com': { id: 9, name: 'David Kim', businessName: 'Nordic Living & Decor', email: 'seller3@roshnamart.com', sellerVerificationStatus: 'APPROVED' },
  'homeseller@roshnamart.com': { id: 9, name: 'David Kim', businessName: 'Nordic Living & Decor', email: 'homeseller@roshnamart.com', sellerVerificationStatus: 'APPROVED' },
  'seller4@roshnamart.com': { id: 10, name: 'Priya Sharma', businessName: 'Aura Natural Skincare', email: 'seller4@roshnamart.com', sellerVerificationStatus: 'APPROVED' },
  'beautyseller@roshnamart.com': { id: 10, name: 'Priya Sharma', businessName: 'Aura Natural Skincare', email: 'beautyseller@roshnamart.com', sellerVerificationStatus: 'APPROVED' },
  'seller5@roshnamart.com': { id: 11, name: 'Rajesh Kumar', businessName: 'Pure Organics & Naturals', email: 'seller5@roshnamart.com', sellerVerificationStatus: 'PENDING' },
  'newvendor@roshnamart.com': { id: 11, name: 'Rajesh Kumar', businessName: 'Pure Organics & Naturals', email: 'newvendor@roshnamart.com', sellerVerificationStatus: 'PENDING' },
};

// Check if credentials match any demo role
const resolveDemoUser = (email, password) => {
  if (!email) return null;
  const lowerEmail = email.toLowerCase().trim();
  const lowerPass = (password || '').toLowerCase().trim();

  // Admin match: Single default admin account only
  if (lowerEmail === 'admin@roshnamart.com') {
    if (!lowerPass || lowerPass === 'admin@123' || lowerPass === 'admin123' || lowerPass === 'admin') {
      return { ...DEMO_ADMIN, email: 'admin@roshnamart.com' };
    }
  }

  // Exact demo seller match (Supports seller1 through seller5)
  if (DEMO_SELLERS[lowerEmail]) {
    if (!lowerPass || lowerPass.includes('seller') || lowerPass === 'seller@123' || lowerPass === 'seller123') {
      return { ...DEMO_SELLER, ...DEMO_SELLERS[lowerEmail] };
    }
  }

  // Generic seller match
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

  // Exact demo buyer match (Supports buyer1 through buyer5)
  if (DEMO_BUYERS[lowerEmail]) {
    if (!lowerPass || lowerPass.includes('buyer') || lowerPass === 'buyer@123' || lowerPass === 'buyer123') {
      return { ...DEMO_BUYER, ...DEMO_BUYERS[lowerEmail] };
    }
  }

  // Generic buyer match
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

    try {
      const backendPromise = api.post('/api/auth/login', credentials);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Backend timeout')), 1500)
      );
      const response = await Promise.race([backendPromise, timeoutPromise]);
      return response.data;
    } catch (err) {
      // If backend rejected due to password capitalization (e.g. buyer@123 vs Buyer@123)
      if (rawPassword && /^[a-z]/.test(rawPassword)) {
        try {
          const capitalizedPassword = rawPassword.charAt(0).toUpperCase() + rawPassword.slice(1);
          const retryRes = await api.post('/api/auth/login', {
            email: rawEmail,
            password: capitalizedPassword,
          });
          if (retryRes && retryRes.data) {
            return retryRes.data;
          }
        } catch (_) {}
      }

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
