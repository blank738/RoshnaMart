import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('roshnamart_user');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to restore saved user:', error);
      localStorage.removeItem('roshnamart_user');
      return null;
    }
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem('roshnamart_token')
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('roshnamart_token');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authService.getCurrentUser();

        setUser((prev) => {
          const updatedUser = {
            ...(prev || {}),
            ...profile,
          };

          localStorage.setItem(
            'roshnamart_user',
            JSON.stringify(updatedUser)
          );

          return updatedUser;
        });
      } catch (err) {
        console.error(
          'Session expired or invalid token:',
          err
        );

        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);

    localStorage.setItem(
      'roshnamart_token',
      data.token
    );

    localStorage.setItem(
      'roshnamart_user',
      JSON.stringify(data)
    );

    setToken(data.token);
    setUser(data);

    return data;
  };

  const registerBuyer = async (buyerData) => {
    const data = await authService.registerBuyer(buyerData);

    localStorage.setItem(
      'roshnamart_token',
      data.token
    );

    localStorage.setItem(
      'roshnamart_user',
      JSON.stringify(data)
    );

    setToken(data.token);
    setUser(data);

    return data;
  };

  const registerSeller = async (sellerData) => {
    const data = await authService.registerSeller(sellerData);

    localStorage.setItem(
      'roshnamart_token',
      data.token
    );

    localStorage.setItem(
      'roshnamart_user',
      JSON.stringify(data)
    );

    setToken(data.token);
    setUser(data);

    return data;
  };

  const logout = () => {
    localStorage.removeItem('roshnamart_token');
    localStorage.removeItem('roshnamart_user');

    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token && user);

  const isBuyer =
    user?.role === 'ROLE_BUYER';

  const isSeller =
    user?.role === 'ROLE_SELLER';

  const isAdmin =
    user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isBuyer,
        isSeller,
        isAdmin,
        login,
        registerBuyer,
        registerSeller,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};