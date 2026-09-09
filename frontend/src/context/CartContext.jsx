import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isBuyer, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !isBuyer) {
      setCart(null);
      return;
    }
    try {
      setCartLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated, isBuyer]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      showToast('Please login as a buyer to add items to your cart', 'warning');
      return false;
    }
    if (!isBuyer) {
      showToast('Only buyer accounts can purchase products', 'warning');
      return false;
    }

    try {
      const updatedCart = await cartService.addToCart(productId, quantity);
      setCart(updatedCart);
      showToast('Item added to cart successfully!', 'success');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add item to cart';
      showToast(message, 'error');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const updatedCart = await cartService.updateCartItem(itemId, quantity);
      setCart(updatedCart);
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update quantity';
      showToast(message, 'error');
      return false;
    }
  };

  const removeItem = async (itemId) => {
    try {
      const updatedCart = await cartService.removeFromCart(itemId);
      setCart(updatedCart);
      showToast('Item removed from cart', 'info');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove item';
      showToast(message, 'error');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart(null);
      showToast('Cart cleared', 'info');
    } catch (err) {
      showToast('Failed to clear cart', 'error');
    }
  };

  const cartCount = cart?.totalItems || 0;
  const cartSubtotal = cart?.subtotal || 0;

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
