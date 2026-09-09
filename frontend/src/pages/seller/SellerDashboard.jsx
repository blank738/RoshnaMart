import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, Package, ShoppingBag, DollarSign, TrendingUp, Star, 
  AlertTriangle, CheckCircle2, ArrowRight, Clock, Plus 
} from 'lucide-react';
import { sellerService } from '../../services/sellerService';
import { useAuth } from '../../context/AuthContext';

export const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashData, ordersData] = await Promise.all([
          sellerService.getDashboard(),
          sellerService.getOrders(0, 5),
        ]);
        setStats(dashData);
        setRecentOrders(ordersData.content || []);
      } catch (err) {
        console.error('Failed to load seller dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const isPending = stats?.verificationStatus === 'PENDING';
  const isSuspended = stats?.verificationStatus === 'SUSPENDED';

  return (
    <div className="container py-8 space-y-8">
      {/* Welcome & Verification Banner */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Store size={14} /> Merchant Partner Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {user?.businessName || user?.name}'s Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time marketplace revenue, commission deductions, inventory and fulfillment
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/seller/products/new"
              className="btn btn-primary btn-sm font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={16} /> Add Product
            </Link>
            <Link
              to="/seller/orders"
              className="btn btn-outline btn-sm font-semibold"
            >
              Manage Orders
            </Link>
          </div>
        </div>

        {isPending && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold">Seller Verification Pending Review</p>
              <p className="text-amber-700">
                Your account is currently undergoing verification by the RoshnaMart administrator. You can prepare products in the catalog, and they will become publicly visible as soon as your account is approved.
              </p>
            </div>
          </div>
        )}

        {isSuspended && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold">Store Temporarily Suspended</p>
              <p className="text-red-700">
                Your seller store has been paused by marketplace compliance. Please contact support@roshnamart.com for assistance.
              </p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading seller metrics...</p>
        </div>
      ) : (
        <>
          {/* Revenue & Sales KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">Gross Merchandise Sales</span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                ₹{Number(stats?.grossRevenue || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Total customer purchase value</span>
            </div>

            <div className="card p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">
                Marketplace Commission ({stats?.commissionPercentage != null ? `${stats.commissionPercentage}%` : 'Standard'})
              </span>
              <p className="text-2xl font-black text-amber-600 mt-1">
                -₹{Number(stats?.commission || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Platform service fee</span>
            </div>

            <div className="card p-5 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/40 shadow-sm">
              <span className="text-xs font-semibold text-emerald-800 block">Net Payout Earnings</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                ₹{Number(stats?.netEarnings || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Ready for settlement</span>
            </div>

            <div className="card p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">Store Rating</span>
              <div className="flex items-center gap-2 mt-1">
                <Star size={24} className="text-amber-500" fill="currentColor" />
                <p className="text-2xl font-black text-slate-900">
                  {stats?.averageRating ? Number(stats.averageRating).toFixed(1) : '5.0'}
                </p>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Verified customer feedback</span>
            </div>
          </div>

          {/* Catalog & Orders Overview Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Total Listed Products</span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{stats?.totalProducts || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Package size={20} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-bold">{stats?.activeProducts || 0} Active</span>
                <span className="text-amber-600 font-bold">{stats?.outOfStockProducts || 0} Out of Stock</span>
              </div>
            </div>

            <div className="card p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Total Orders</span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{stats?.totalOrders || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <ShoppingBag size={20} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                Fulfilled items from multi-vendor checkouts
              </div>
            </div>

            <div className="card p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Verification Status</span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{stats?.verificationStatus || 'APPROVED'}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-emerald-700 font-semibold">
                Authorized RoshnaMart Merchant
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
                <p className="text-xs text-slate-500">Order items containing your listed inventory</p>
              </div>
              <Link to="/seller/orders" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                View All Orders <ArrowRight size={14} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No orders received for your products yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Order Ref</th>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Subtotal</th>
                      <th className="py-3 px-4">Your Earning</th>
                      <th className="py-3 px-4">Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {item.orderNumber || `ITEM-${item.id}`}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 max-w-[200px] truncate">
                          {item.productName}
                        </td>
                        <td className="py-3 px-4 font-bold">{item.quantity}</td>
                        <td className="py-3 px-4">₹{Number(item.subtotal).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          ₹{Number(item.sellerEarning || (item.subtotal * 0.95)).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="badge badge-info text-[10px] uppercase font-bold">
                            {item.itemStatus || 'PROCESSING'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
