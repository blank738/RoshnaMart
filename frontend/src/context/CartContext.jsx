import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { DEFAULT_PRODUCTS } from '../data/defaultCatalog';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'roshnamart_cart';

const loadLocalCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading cart from localStorage:', e);
  }
  return {
    id: 'local_cart',
    items: [],
    totalItems: 0,
    subtotal: 0,
  };
};

const saveLocalCart = (cartData) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  } catch (e) {
    console.error('Error saving cart to localStorage:', e);
  }
};

const calculateCartTotals = (items) => {
  const totalItems = items.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  );
  const subtotal = items.reduce((sum, item) => {
    const price = Number(
      item.productDiscountPrice !== null &&
        item.productDiscountPrice !== undefined
        ? item.productDiscountPrice
        : item.productPrice || 0
    );
    return sum + price * Number(item.quantity || 1);
  }, 0);

  return {
    id: 'roshnamart_active_cart',
    items,
    totalItems,
    subtotal,
  };
};

export const CartProvider = ({ children }) => {
  const { isBuyer, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [cart, setCart] = useState(() => {
    const initial = loadLocalCart();
    return initial.items.length > 0 ? initial : null;
  });
  const [cartLoading, setCartLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !isBuyer) {
      const local = loadLocalCart();
      setCart(local.items.length > 0 ? local : null);
      return;
    }

    try {
      setCartLoading(true);
      const backendPromise = cartService.getCart();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Backend timeout')), 2000)
      );
      const data = await Promise.race([backendPromise, timeoutPromise]);

      if (data && Array.isArray(data.items)) {
        setCart(data);
        saveLocalCart(data);
        return;
      }
    } catch (err) {
      console.warn('Backend getCart unavailable, using local cart:', err.message);
    } finally {
      setCartLoading(false);
    }

    // Fallback to local cart if backend call failed
    const local = loadLocalCart();
    setCart(local.items.length > 0 ? local : null);
  }, [isAuthenticated, isBuyer]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1, productObj = null) => {
    const prodIdNum = Number(productId);

    // Resolve full product details
    const resolvedProduct =
      productObj ||
      DEFAULT_PRODUCTS.find(
        (p) => Number(p.id) === prodIdNum || String(p.id) === String(productId)
      );

    // If authenticated as a buyer, try syncing with the backend
    if (isAuthenticated && isBuyer) {
      try {
        const backendPromise = cartService.addToCart(productId, quantity);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Backend timeout')), 1800)
        );
        const updatedCart = await Promise.race([
          backendPromise,
          timeoutPromise,
        ]);

        if (updatedCart && Array.isArray(updatedCart.items)) {
          setCart(updatedCart);
          saveLocalCart(updatedCart);
          showToast('Item added to cart successfully!', 'success');
          return true;
        }
      } catch (err) {
        console.warn(
          'Backend addToCart unavailable or failed, keeping local cart in sync:',
          err.message
        );
      }
    }

    // High-reliability local cart update (works offline, for guests, or backend timeouts)
    const currentCart = cart || loadLocalCart();
    const existingItems = [...(currentCart.items || [])];
    const existingIndex = existingItems.findIndex(
      (it) =>
        Number(it.productId) === prodIdNum ||
        String(it.productId) === String(productId)
    );

    const price = Number(
      resolvedProduct?.discountPrice || resolvedProduct?.price || 0
    );
    const unitPrice =
      resolvedProduct?.discountPrice !== undefined &&
      resolvedProduct?.discountPrice !== null
        ? Number(resolvedProduct.discountPrice)
        : Number(resolvedProduct?.price || price);

    if (existingIndex >= 0) {
      const existing = existingItems[existingIndex];
      const newQty = Number(existing.quantity || 1) + Number(quantity);
      const itemUnitPrice = Number(
        existing.productDiscountPrice !== null &&
          existing.productDiscountPrice !== undefined
          ? existing.productDiscountPrice
          : existing.productPrice || unitPrice
      );

      existingItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        subtotal: newQty * itemUnitPrice,
      };
    } else {
      const newItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        productId: prodIdNum || productId,
        productName: resolvedProduct?.name || 'Marketplace Item',
        productPrice: Number(resolvedProduct?.price || unitPrice),
        productDiscountPrice:
          resolvedProduct?.discountPrice !== undefined &&
          resolvedProduct?.discountPrice !== null
            ? Number(resolvedProduct.discountPrice)
            : null,
        productImageUrl:
          resolvedProduct?.imageUrl ||
          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300',
        sellerBusinessName:
          resolvedProduct?.sellerBusinessName || 'RoshnaMart Merchant',
        productStockQuantity: Number(resolvedProduct?.quantity || 50),
        quantity: Number(quantity),
        subtotal: Number(quantity) * Number(unitPrice),
      };
      existingItems.push(newItem);
    }

    const updatedLocalCart = calculateCartTotals(existingItems);
    setCart(updatedLocalCart);
    saveLocalCart(updatedLocalCart);

    showToast('Item added to cart successfully!', 'success');
    return true;
  };

  const updateQuantity = async (itemId, quantity) => {
    if (isAuthenticated && isBuyer) {
      try {
        const backendPromise = cartService.updateCartItem(itemId, quantity);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Backend timeout')), 1800)
        );
        const updatedCart = await Promise.race([
          backendPromise,
          timeoutPromise,
        ]);

        if (updatedCart && Array.isArray(updatedCart.items)) {
          setCart(updatedCart);
          saveLocalCart(updatedCart);
          return true;
        }
      } catch (err) {
        console.warn('Backend updateCartItem failed, updating locally:', err.message);
      }
    }

    // Local cart update
    const currentCart = cart || loadLocalCart();
    const updatedItems = (currentCart.items || [])
      .map((it) => {
        if (it.id === itemId || String(it.id) === String(itemId)) {
          const itemUnitPrice = Number(
            it.productDiscountPrice !== null &&
              it.productDiscountPrice !== undefined
              ? it.productDiscountPrice
              : it.productPrice || 0
          );
          return {
            ...it,
            quantity: Number(quantity),
            subtotal: Number(quantity) * itemUnitPrice,
          };
        }
        return it;
      })
      .filter((it) => it.quantity > 0);

    const updatedLocalCart = calculateCartTotals(updatedItems);
    setCart(updatedLocalCart);
    saveLocalCart(updatedLocalCart);
    return true;
  };

  const removeItem = async (itemId) => {
    if (isAuthenticated && isBuyer) {
      try {
        const backendPromise = cartService.removeFromCart(itemId);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Backend timeout')), 1800)
        );
        const updatedCart = await Promise.race([
          backendPromise,
          timeoutPromise,
        ]);

        if (updatedCart && Array.isArray(updatedCart.items)) {
          setCart(updatedCart);
          saveLocalCart(updatedCart);
          showToast('Item removed from cart', 'info');
          return true;
        }
      } catch (err) {
        console.warn('Backend removeFromCart failed, updating locally:', err.message);
      }
    }

    // Local remove
    const currentCart = cart || loadLocalCart();
    const updatedItems = (currentCart.items || []).filter(
      (it) => it.id !== itemId && String(it.id) !== String(itemId)
    );

    const updatedLocalCart = calculateCartTotals(updatedItems);
    setCart(updatedItems.length > 0 ? updatedLocalCart : null);
    saveLocalCart(updatedLocalCart);
    showToast('Item removed from cart', 'info');
    return true;
  };

  const clearCart = async () => {
    if (isAuthenticated && isBuyer) {
      try {
        await cartService.clearCart();
      } catch (err) {
        console.warn('Backend clearCart failed:', err.message);
      }
    }

    const emptyCart = {
      id: 'local_cart',
      items: [],
      totalItems: 0,
      subtotal: 0,
    };
    saveLocalCart(emptyCart);
    setCart(null);
    showToast('Cart cleared', 'info');
  };

  const cartCount =
    cart?.totalItems ||
    cart?.items?.reduce((sum, it) => sum + Number(it.quantity || 1), 0) ||
    0;
  const cartSubtotal = Number(cart?.subtotal || 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        cartLoading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};
