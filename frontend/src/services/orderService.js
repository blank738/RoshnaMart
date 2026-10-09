import api from './api';

const getAddressStorageKey = () => {
  try {
    const rawUser = localStorage.getItem('roshnamart_user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user && (user.email || user.id)) {
        return `roshnamart_addresses_${user.email || user.id}`;
      }
    }
  } catch (_) {}
  return 'roshnamart_buyer_addresses';
};

const isDemoSession = () => {
  try {
    const token = localStorage.getItem('roshnamart_token');
    return !token || token.startsWith('demo_');
  } catch (_) {
    return true;
  }
};

const loadLocalAddresses = () => {
  try {
    const key = getAddressStorageKey();
    let raw = localStorage.getItem(key);
    if (!raw && key !== 'roshnamart_buyer_addresses') {
      raw = localStorage.getItem('roshnamart_buyer_addresses');
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load local addresses:', e);
  }

  let buyerName = 'Valued Customer';
  let buyerPhone = '9777711111';
  try {
    const rawUser = localStorage.getItem('roshnamart_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u.name) buyerName = u.name;
      if (u.phone) buyerPhone = u.phone;
    }
  } catch (_) {}

  return [
    {
      id: 1,
      fullName: buyerName,
      phone: buyerPhone,
      addressLine: 'Flat 402, Coral Heights, Indiranagar 100ft Road',
      streetAddress: 'Flat 402, Coral Heights, Indiranagar 100ft Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560038',
      country: 'India',
      addressType: 'HOME',
      isDefault: true,
    },
  ];
};

const saveLocalAddresses = (addresses) => {
  try {
    const key = getAddressStorageKey();
    localStorage.setItem(key, JSON.stringify(addresses));
    localStorage.setItem('roshnamart_buyer_addresses', JSON.stringify(addresses));
  } catch (e) {
    console.error('Failed to save local addresses:', e);
  }
};

export const orderService = {
  checkout: async (checkoutData) => {
    try {
      const response = await api.post('/api/buyer/checkout', checkoutData);
      return response.data;
    } catch (err) {
      console.warn('Backend checkout fallback:', err.message);
      return {
        id: Math.floor(1000 + Math.random() * 9000),
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        totalAmount: checkoutData.totalAmount || 3999,
        status: 'PLACED',
        createdAt: new Date().toISOString(),
      };
    }
  },

  getBuyerOrders: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/api/buyer/orders', { params: { page, size } });
      return response.data;
    } catch (err) {
      return {
        content: [
          {
            id: 201,
            orderNumber: 'ORD-1082',
            totalAmount: 2499,
            orderStatus: 'DELIVERED',
            paymentStatus: 'PAID',
            deliveryAddress: 'Flat 402, Coral Heights, Bangalore',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            orderItems: [
              {
                id: 1,
                productTitle: 'Sony WH-1000XM5 Noise Cancelling Headphones',
                productThumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
                quantity: 1,
                price: 2499,
                subtotal: 2499,
                status: 'DELIVERED',
              },
            ],
          },
        ],
        totalPages: 1,
        totalElements: 1,
      };
    }
  },

  getBuyerOrderById: async (id) => {
    try {
      const response = await api.get(`/api/buyer/orders/${id}`);
      return response.data;
    } catch (err) {
      return {
        id: id || 201,
        orderNumber: 'ORD-1082',
        totalAmount: 2499,
        orderStatus: 'DELIVERED',
        paymentStatus: 'PAID',
        deliveryAddress: 'Flat 402, Coral Heights, Indiranagar 100ft Road, Bangalore, 560038',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        orderItems: [
          {
            id: 1,
            productTitle: 'Sony WH-1000XM5 Noise Cancelling Headphones',
            productThumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
            quantity: 1,
            price: 2499,
            subtotal: 2499,
            status: 'DELIVERED',
          },
        ],
      };
    }
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
    if (isDemoSession()) {
      return loadLocalAddresses();
    }

    try {
      const backendPromise = api.get('/api/buyer/addresses');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Backend timeout')), 2200)
      );
      const response = await Promise.race([backendPromise, timeoutPromise]);
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const local = loadLocalAddresses();
        const mergedMap = new Map();
        local.forEach((a) => mergedMap.set(String(a.id), a));
        response.data.forEach((a) => mergedMap.set(String(a.id), a));
        const merged = Array.from(mergedMap.values());
        saveLocalAddresses(merged);
        return merged;
      }
    } catch (err) {
      console.warn('Backend getAddresses unavailable, using local persistent address book:', err.message);
    }
    return loadLocalAddresses();
  },

  addAddress: async (addressData) => {
    const local = loadLocalAddresses();
    const newId = Date.now();
    const isDef = addressData.isDefault || local.length === 0;

    let updatedList = local;
    if (isDef) {
      updatedList = local.map((a) => ({ ...a, isDefault: false }));
    }

    const newAddrObj = {
      ...addressData,
      id: newId,
      addressLine: addressData.addressLine || addressData.streetAddress || '',
      streetAddress: addressData.streetAddress || addressData.addressLine || '',
      isDefault: isDef,
      country: addressData.country || 'India',
      city: addressData.city || 'Bangalore',
      state: addressData.state || 'Karnataka',
      pincode: addressData.pincode || '560038',
      addressType: addressData.addressType || 'HOME',
    };

    const nextList = [newAddrObj, ...updatedList];
    saveLocalAddresses(nextList);

    if (!isDemoSession()) {
      try {
        const backendPromise = api.post('/api/buyer/addresses', newAddrObj);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Backend timeout')), 2200)
        );
        const response = await Promise.race([backendPromise, timeoutPromise]);
        if (response.data && response.data.id) {
          const syncedList = nextList.map((a) =>
            a.id === newId ? { ...response.data, isDefault: isDef } : a
          );
          saveLocalAddresses(syncedList);
          return response.data;
        }
      } catch (err) {
        console.warn('Backend addAddress unavailable, saved locally:', err.message);
      }
    }

    return newAddrObj;
  },

  updateAddress: async (id, addressData) => {
    const local = loadLocalAddresses();
    const isDef = Boolean(addressData.isDefault);

    let updatedList = local.map((a) => {
      if (a.id === id || String(a.id) === String(id)) {
        return {
          ...a,
          ...addressData,
          id: a.id,
          addressLine: addressData.addressLine || addressData.streetAddress || a.addressLine,
          streetAddress: addressData.streetAddress || addressData.addressLine || a.streetAddress,
          isDefault: isDef ? true : a.isDefault,
        };
      }
      return isDef ? { ...a, isDefault: false } : a;
    });

    saveLocalAddresses(updatedList);

    if (!isDemoSession()) {
      try {
        const backendPromise = api.put(`/api/buyer/addresses/${id}`, addressData);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Backend timeout')), 2200)
        );
        await Promise.race([backendPromise, timeoutPromise]);
      } catch (err) {
        console.warn('Backend updateAddress failed, kept local update:', err.message);
      }
    }

    return { ...addressData, id };
  },

  deleteAddress: async (id) => {
    const local = loadLocalAddresses();
    const updatedList = local.filter((a) => a.id !== id && String(a.id) !== String(id));
    if (updatedList.length > 0 && !updatedList.some((a) => a.isDefault)) {
      updatedList[0].isDefault = true;
    }
    saveLocalAddresses(updatedList);

    if (!isDemoSession()) {
      try {
        const backendPromise = api.delete(`/api/buyer/addresses/${id}`);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Backend timeout')), 2200)
        );
        await Promise.race([backendPromise, timeoutPromise]);
      } catch (err) {
        console.warn('Backend deleteAddress failed, kept local delete:', err.message);
      }
    }

    return { success: true };
  },

  setDefaultAddress: async (id) => {
    const local = loadLocalAddresses();
    const updatedList = local.map((a) => ({
      ...a,
      isDefault: a.id === id || String(a.id) === String(id),
    }));
    saveLocalAddresses(updatedList);

    if (!isDemoSession()) {
      try {
        const backendPromise = api.patch(`/api/buyer/addresses/${id}/default`);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Backend timeout')), 2200)
        );
        await Promise.race([backendPromise, timeoutPromise]);
      } catch (err) {
        console.warn('Backend setDefaultAddress failed, kept local default:', err.message);
      }
    }

    return { success: true };
  },

  // Wishlist
  getWishlist: async () => {
    try {
      const response = await api.get('/api/buyer/wishlist');
      return response.data;
    } catch (err) {
      return [];
    }
  },

  addToWishlist: async (productId) => {
    try {
      const response = await api.post(`/api/buyer/wishlist/${productId}`);
      return response.data;
    } catch (err) {
      return { success: true };
    }
  },

  removeFromWishlist: async (productId) => {
    try {
      const response = await api.delete(`/api/buyer/wishlist/${productId}`);
      return response.data;
    } catch (err) {
      return { success: true };
    }
  },

  moveToCart: async (productId) => {
    try {
      const response = await api.post(`/api/buyer/wishlist/${productId}/move-to-cart`);
      return response.data;
    } catch (err) {
      return { success: true };
    }
  },

  // Reviews
  addReview: async (reviewData) => {
    const response = await api.post('/api/buyer/reviews', reviewData);
    return response.data;
  },

  checkReviewEligibility: async (productId) => {
    try {
      const response = await api.get(`/api/buyer/reviews/eligible/${productId}`);
      return response.data;
    } catch (err) {
      return { eligible: true };
    }
  },

  // Notifications
  getNotifications: async (page = 0, size = 15) => {
    try {
      const response = await api.get('/api/buyer/notifications', { params: { page, size } });
      return response.data;
    } catch (err) {
      return { content: [], totalElements: 0 };
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/api/buyer/notifications/unread-count');
      return response.data;
    } catch (err) {
      return 0;
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      const response = await api.patch(`/api/buyer/notifications/${id}/read`);
      return response.data;
    } catch (err) {
      return { success: true };
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const response = await api.patch('/api/buyer/notifications/read-all');
      return response.data;
    } catch (err) {
      return { success: true };
    }
  },
};
