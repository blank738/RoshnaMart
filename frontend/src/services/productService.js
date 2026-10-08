import api from './api';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_REVIEWS,
} from '../data/defaultCatalog';

export const productService = {
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/api/products', { params });
      if (response.data && Array.isArray(response.data.content) && response.data.content.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('API /api/products unavailable or empty, using catalog fallback:', err.message);
    }

    // High-reliability catalog fallback for filtering & pagination
    let list = [...DEFAULT_PRODUCTS];

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
    }

    if (params.categoryId) {
      list = list.filter(
        (p) => String(p.categoryId) === String(params.categoryId)
      );
    }

    if (params.minPrice) {
      const min = parseFloat(params.minPrice);
      if (!isNaN(min)) {
        list = list.filter((p) => (p.discountPrice || p.price) >= min);
      }
    }

    if (params.maxPrice) {
      const max = parseFloat(params.maxPrice);
      if (!isNaN(max)) {
        list = list.filter((p) => (p.discountPrice || p.price) <= max);
      }
    }

    if (params.minRating) {
      const r = parseFloat(params.minRating);
      if (!isNaN(r)) {
        list = list.filter((p) => (p.rating || 0) >= r);
      }
    }

    if (params.sortBy === 'priceAsc') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (params.sortBy === 'priceDesc') {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (params.sortBy === 'ratingDesc') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    const page = parseInt(params.page || '0', 10);
    const size = parseInt(params.size || '12', 10);
    const start = page * size;
    const paginated = list.slice(start, start + size);

    return {
      content: paginated,
      totalPages: Math.ceil(list.length / size) || 1,
      totalElements: list.length,
      number: page,
      size,
    };
  },

  getProductById: async (id) => {
    try {
      const response = await api.get(`/api/products/${id}`);
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (err) {
      console.warn(`API /api/products/${id} unavailable, using catalog fallback:`, err.message);
    }

    const fallbackProduct = DEFAULT_PRODUCTS.find((p) => String(p.id) === String(id));
    if (fallbackProduct) {
      return fallbackProduct;
    }
    // Return first product if ID doesn't exist
    return DEFAULT_PRODUCTS[0];
  },

  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/api/products/featured');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('API /api/products/featured unavailable, using catalog fallback:', err.message);
    }
    return DEFAULT_PRODUCTS.slice(0, 8);
  },

  getDiscountedProducts: async () => {
    try {
      const response = await api.get('/api/products/discounted');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('API /api/products/discounted unavailable, using catalog fallback:', err.message);
    }
    return DEFAULT_PRODUCTS.filter((p) => p.discountPrice && p.discountPrice < p.price).slice(0, 4);
  },

  getCategories: async () => {
    try {
      const response = await api.get('/api/categories');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('API /api/categories unavailable, using catalog fallback:', err.message);
    }
    return DEFAULT_CATEGORIES;
  },

  getProductReviews: async (productId) => {
    try {
      const response = await api.get(`/api/products/${productId}/reviews`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn(`API /api/products/${productId}/reviews unavailable, using catalog fallback:`, err.message);
    }
    return DEFAULT_REVIEWS;
  },

  getMarketplaceSettings: async () => {
    try {
      const response = await api.get('/api/settings');
      if (response.data) return response.data;
    } catch (err) {
      // ignore
    }
    return {
      freeShippingThreshold: 999,
      defaultShippingFee: 40,
      commissionPercentage: 5.0,
    };
  },
};
