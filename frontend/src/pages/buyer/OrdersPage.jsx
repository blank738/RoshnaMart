import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, Clock, CheckCircle2, XCircle, ArrowRight, 
  RotateCcw, Store, ShoppingBag, Eye 
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const OrdersPage = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = async (p = 0) => {
    try {
      setLoading(true);
      const data = await orderService.getBuyerOrders(p, 10);
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(p);
    } catch (err) {
      console.error('Failed to load orders:', err);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0);
  }, []);

  const handleBuyAgain = async (orderId) => {
    try {
      await orderService.buyAgain(orderId);
      await refreshCart();
      showToast('Items added back to your cart!', 'success');
      navigate('/buyer/cart');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not re-order items', 'error');
    }
  };

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

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'ALL') return true;
    return o.orderStatus === activeFilter;
  });

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Orders</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track multi-vendor deliveries, access invoices, and request returns
          </p>
        </div>
        <Link to="/products" className="btn btn-outline btn-sm text-xs self-start sm:self-auto">
          Explore Products
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['ALL', 'PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveFilter(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeFilter === tab
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading your order history...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Package size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {activeFilter === 'ALL'
                ? "You haven't placed any orders yet."
                : `No orders found in status "${activeFilter}".`}
            </p>
          </div>
          <Link to="/products" className="btn btn-primary btn-sm inline-flex items-center gap-1.5">
            <span>Shop Now</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="card rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {/* Order Header */}
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Order Placed</span>
                    <span className="font-bold text-slate-800">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Amount</span>
                    <span className="font-extrabold text-slate-900">
                      ₹{Number(order.finalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Order Number</span>
                    <span className="font-mono font-bold text-slate-800">{order.orderNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`badge ${getStatusBadgeClass(order.orderStatus)} text-[10px] uppercase font-bold`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="divide-y divide-slate-100">
                  {order.items?.map((item) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                          alt={item.productName}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                        />
                        <div className="space-y-0.5">
                          <Link
                            to={`/products/${item.productId}`}
                            className="font-bold text-xs text-slate-900 hover:text-emerald-600 transition line-clamp-1"
                          >
                            {item.productName}
                          </Link>
                          {item.sellerBusinessName && (
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Store size={11} className="text-emerald-600" />
                              <span>Sold by {item.sellerBusinessName}</span>
                            </p>
                          )}
                          <p className="text-xs text-slate-600">
                            Qty: <span className="font-bold">{item.quantity}</span> × ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 block">
                          ₹{Number(item.subtotal).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.itemStatus || order.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">
                    Paid via <span className="font-bold text-slate-700 uppercase">{order.paymentMethod}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBuyAgain(order.id)}
                      className="btn btn-outline btn-sm text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1"
                    >
                      <RotateCcw size={13} /> Buy Again
                    </button>
                    <Link
                      to={`/buyer/orders/${order.id}`}
                      className="btn btn-primary btn-sm text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
                    >
                      <Eye size={14} /> View Details & Tracking
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
