import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Heart,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Store,
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  Star,
  Loader2,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { sellerService } from '../services/sellerService';
import { productService } from '../services/productService';

export const Navbar = () => {
  const {
    user,
    isAuthenticated,
    isBuyer,
    isSeller,
    isAdmin,
    logout,
  } = useAuth();

  const { cartCount } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchContainerRef = useRef(null);

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [settings, setSettings] = useState({
    freeDeliveryThreshold: 500,
    platformName: 'RoshnaMart',
  });

  // ------------------------------------------------------------
  // PUBLIC MARKETPLACE SETTINGS
  // ------------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    productService
      .getMarketplaceSettings()
      .then((data) => {
        if (mounted && data) {
          setSettings((prev) => ({
            ...prev,
            ...data,
          }));
        }
      })
      .catch(() => { });

    return () => {
      mounted = false;
    };
  }, []);

  // ------------------------------------------------------------
  // UNREAD NOTIFICATIONS
  // ------------------------------------------------------------

  const fetchUnreadNotifications = async () => {
    if (!isAuthenticated) {
      setUnreadNotifications(0);
      return;
    }

    try {
      if (isBuyer) {
        const res = await orderService.getUnreadCount();
        setUnreadNotifications(Number(res?.count || 0));
      } else if (isSeller) {
        const res = await sellerService.getUnreadCount();
        setUnreadNotifications(Number(res?.count || 0));
      } else {
        setUnreadNotifications(0);
      }
    } catch (error) {
      console.error('Notification count error:', error);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
  }, [isAuthenticated, isBuyer, isSeller, location.pathname]);

  // Refresh notification count periodically
  useEffect(() => {
    if (!isAuthenticated || (!isBuyer && !isSeller)) {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchUnreadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isBuyer, isSeller]);

  // ------------------------------------------------------------
  // PRODUCT SEARCH SUGGESTIONS
  // ------------------------------------------------------------

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);

        const data = await productService.getProducts({
          search: query,
          size: 5,
        });

        setSuggestions(data?.content || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Suggestion search error:', error);
        setSuggestions([]);
        setShowSuggestions(true);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ------------------------------------------------------------
  // CLOSE SEARCH SUGGESTIONS
  // ------------------------------------------------------------

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ------------------------------------------------------------
  // SEARCH
  // ------------------------------------------------------------

  const handleSearch = (e) => {
    e.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    setShowSuggestions(false);
    navigate(`/products?search=${encodeURIComponent(query)}`);
    setSearchQuery('');
    setMobileMenuOpen(false);
  };

  const handleSelectSuggestion = (productId) => {
    if (!productId) return;

    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/products/${productId}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // ------------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------------

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  // ------------------------------------------------------------
  // CLOSE DROPDOWN ON ROUTE CHANGE
  // ------------------------------------------------------------

  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Utility Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={14}
              className="text-emerald-400"
            />

            <span>
              100% Verified Sellers & Genuine Quality Marketplace
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-emerald-300">
            <span>
              Free delivery on orders over ₹
              {Number(
                settings.freeDeliveryThreshold || 500
              ).toLocaleString('en-IN')}
            </span>

            <span>•</span>

            <Link
              to="/about"
              className="hover:text-white transition"
            >
              About {settings.platformName || 'RoshnaMart'}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container py-3.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-2xl tracking-tight text-slate-900 flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <ShoppingBag size={22} />
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="leading-none font-extrabold text-slate-900 tracking-wider">
              ROSHNA<span className="text-emerald-600">MART</span>
            </span>

            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">
              Multi-Vendor Market
            </span>
          </div>
        </Link>

        {/* Desktop Search */}
        <div
          ref={searchContainerRef}
          className="hidden md:flex flex-1 max-w-xl relative"
        >
          <form
            onSubmit={handleSearch}
            className="w-full relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder="Search products, brands, verified sellers, categories..."
              className="w-full pl-11 pr-24 py-2.5 bg-slate-100/90 border border-slate-200 rounded-full text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              aria-label="Search products"
            />

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}

            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition shadow-sm cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="search-suggestions-dropdown">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2
                    size={16}
                    className="animate-spin text-emerald-600"
                  />
                  <span>Searching marketplace catalog...</span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No matching products found for "{searchQuery}".
                </div>
              ) : (
                <>
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                    <span>
                      Products Matching "{searchQuery}"
                    </span>

                    <span className="text-emerald-600 font-semibold">
                      {suggestions.length} items
                    </span>
                  </div>

                  {suggestions.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() =>
                        handleSelectSuggestion(item.id)
                      }
                      className="search-suggestion-item cursor-pointer w-full text-left"
                    >
                      <img
                        src={
                          item.imageUrl ||
                          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80'
                        }
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </p>

                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Store
                            size={10}
                            className="text-emerald-600"
                          />

                          <span className="truncate">
                            {item.sellerBusinessName ||
                              'Verified Merchant'}
                          </span>
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-black text-slate-900">
                          ₹
                          {Number(
                            item.discountPrice || item.price
                          ).toLocaleString('en-IN')}
                        </p>

                        {item.rating > 0 && (
                          <span className="text-[10px] text-amber-500 font-bold flex items-center justify-end gap-0.5">
                            <Star
                              size={10}
                              fill="currentColor"
                            />
                            {Number(item.rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      View all results for "{searchQuery}" →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="hidden lg:inline-flex text-sm font-medium text-slate-700 hover:text-emerald-600 transition px-2 py-1"
          >
            Browse Catalog
          </Link>

          {/* Seller Portal */}
          {isAuthenticated && isSeller && (
            <Link
              to="/seller/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition"
            >
              <Store size={15} />
              <span>Seller Hub</span>
            </Link>
          )}

          {/* Admin Portal */}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
            >
              <ShieldCheck size={15} />
              <span>Admin Center</span>
            </Link>
          )}

          {/* Buyer Actions */}
          {(!isAuthenticated || isBuyer) && (
            <>
              <Link
                to={
                  isAuthenticated
                    ? '/buyer/wishlist'
                    : '/login'
                }
                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition relative"
                title="Wishlist"
              >
                <Heart size={20} />
              </Link>

              {isAuthenticated && (
                <Link
                  to="/buyer/notifications"
                  className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition relative"
                  title="Notifications"
                >
                  <Bell size={20} />

                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadNotifications > 9
                        ? '9+'
                        : unreadNotifications}
                    </span>
                  )}
                </Link>
              )}

              <Link
                to={
                  isAuthenticated
                    ? '/buyer/cart'
                    : '/login'
                }
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-full font-semibold text-sm transition shadow-sm"
              >
                <ShoppingCart size={18} />

                <span className="hidden sm:inline">
                  Cart
                </span>

                <span className="w-5 h-5 bg-white text-emerald-700 rounded-full text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              </Link>
            </>
          )}

          {/* Seller Notifications */}
          {isAuthenticated && isSeller && (
            <Link
              to="/seller/dashboard"
              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition relative"
              title="Seller Orders & Notifications"
            >
              <Bell size={20} />

              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifications > 9
                    ? '9+'
                    : unreadNotifications}
                </span>
              )}
            </Link>
          )}

          {/* Account */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setUserDropdownOpen(
                    (previous) => !previous
                  )
                }
                className="flex items-center gap-2 p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition border border-slate-200 cursor-pointer"
                aria-expanded={userDropdownOpen}
                aria-haspopup="menu"
              >
                <div className="w-7 h-7 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase() ||
                    'U'}
                </div>

                <span className="text-xs font-semibold max-w-[90px] truncate hidden md:inline">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>

                <ChevronDown
                  size={14}
                  className="text-slate-400"
                />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">
                      Signed in as
                    </p>

                    <p className="text-sm font-bold text-slate-900 truncate">
                      {user?.name || 'User'}
                    </p>

                    <span className="badge badge-success text-[10px] mt-1">
                      {user?.role?.replace('ROLE_', '') ||
                        'USER'}
                    </span>
                  </div>

                  {/* Buyer Menu */}
                  {isBuyer && (
                    <>
                      <Link
                        to="/buyer/dashboard"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <LayoutDashboard size={16} />
                        Buyer Dashboard
                      </Link>

                      <Link
                        to="/buyer/orders"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Package size={16} />
                        My Orders
                      </Link>

                      <Link
                        to="/buyer/profile"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User size={16} />
                        Profile & Addresses
                      </Link>
                    </>
                  )}

                  {/* Seller Menu */}
                  {isSeller && (
                    <>
                      <Link
                        to="/seller/dashboard"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <LayoutDashboard size={16} />
                        Seller Dashboard
                      </Link>

                      <Link
                        to="/seller/products"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Package size={16} />
                        Manage Products
                      </Link>

                      <Link
                        to="/seller/orders"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <FileText size={16} />
                        Customer Orders
                      </Link>

                      <Link
                        to="/seller/profile"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User size={16} />
                        Seller Profile
                      </Link>
                    </>
                  )}

                  {/* Admin Menu */}
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </Link>

                      <Link
                        to="/admin/sellers"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Store size={16} />
                        Verify Sellers
                      </Link>

                      <Link
                        to="/admin/settings"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Settings size={16} />
                        Platform Settings
                      </Link>
                    </>
                  )}

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="btn btn-outline btn-sm"
              >
                Sign In
              </Link>

              <Link
                to="/register/buyer"
                className="btn btn-primary btn-sm hidden sm:inline-flex"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((previous) => !previous)
            }
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-3">
          <form
            onSubmit={handleSearch}
            className="relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
              aria-label="Search products"
            />

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </form>

          <div className="flex flex-col gap-1 text-sm font-medium">
            <Link
              to="/"
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              Home
            </Link>

            <Link
              to="/products"
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              All Products
            </Link>

            <Link
              to="/about"
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              About {settings.platformName || 'RoshnaMart'}
            </Link>

            <Link
              to="/register/seller"
              className="py-2 px-3 rounded-lg hover:bg-slate-50 text-emerald-600 font-semibold"
            >
              Sell on {settings.platformName || 'RoshnaMart'}
            </Link>

            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="py-2 px-3 rounded-lg hover:bg-slate-50"
                >
                  Sign In
                </Link>

                <Link
                  to="/register/buyer"
                  className="py-2 px-3 rounded-lg bg-emerald-50 text-emerald-700 font-semibold"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};