import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Package, Heart, Bell, ShoppingCart, Clock, 
  ArrowRight, ShieldCheck, MapPin, ChevronRight, Sparkles 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { ProductCard } from '../../components/ProductCard';

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const { cartCount } = useCart();

  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [ordersData, wishlistData, notifData, recProducts] = await Promise.all([
          orderService.getBuyerOrders(0, 4),
          orderService.getWishlist().catch(() => []),
          orderService.getUnreadCount().catch(() => ({ count: 0 })),
          productService.getFeaturedProducts().catch(() => []),
        ]);

        setOrders(ordersData.content || []);
        setWishlistCount(wishlistData?.length || 0);
        setUnreadNotifications(notifData?.count || 0);
        setRecommended(recProducts?.slice(0, 4) || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'badge-success';
      case 'CANCELLED':
        return 'badge-danger';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white border-none shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold text-emerald-200">
            <Sparkles size={14} /> Buyer Account Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Valued Shopper'}!
          </h1>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Welcome to your RoshnaMart account. Track active shipments from multiple independent vendors, manage delivery addresses, and browse personalized recommendations.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none hidden sm:block"></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/buyer/orders" className="card card-hover p-4 sm:p-5 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{orders.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            View order history <ChevronRight size={12} />
          </span>
        </Link>

        <Link to="/buyer/cart" className="card card-hover p-4 sm:p-5 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">In Cart</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingCart size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{cartCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            Proceed to checkout <ChevronRight size={12} />
          </span>
        </Link>

        <Link to="/buyer/wishlist" className="card card-hover p-4 sm:p-5 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Wishlist</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <Heart size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{wishlistCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            Saved products <ChevronRight size={12} />
          </span>
        </Link>

        <Link to="/buyer/notifications" className="card card-hover p-4 sm:p-5 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{unreadNotifications}</p>
          <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            Unread updates <ChevronRight size={12} />
          </span>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
            <p className="text-xs text-slate-500">Track and manage your latest multi-vendor shipments</p>
          </div>
          <Link to="/buyer/orders" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
            View All Orders <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="card p-12 text-center bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-500">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
              <p className="text-xs text-slate-500 mt-1">Explore our verified vendor catalog and start shopping!</p>
            </div>
            <Link to="/products" className="btn btn-primary btn-sm inline-flex items-center gap-1.5">
              <span>Browse Catalog</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="card card-hover p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-800">{order.orderNumber}</span>
                    <span className={`badge ${getStatusBadgeClass(order.orderStatus)} text-[10px]`}>
                      {order.orderStatus}
                    </span>
                    <span className="text-xs text-slate-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {order.items?.length || 0} items • Paid via <span className="font-semibold">{order.paymentMethod}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Total</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ₹{Number(order.finalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <Link
                    to={`/buyer/orders/${order.id}`}
                    className="btn btn-outline btn-sm text-xs font-bold py-1.5 px-3 rounded-lg"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Products */}
      {recommended.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recommended For You</h2>
              <p className="text-xs text-slate-500">Popular items from verified merchants</p>
            </div>
            <Link to="/products" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              Browse More <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
