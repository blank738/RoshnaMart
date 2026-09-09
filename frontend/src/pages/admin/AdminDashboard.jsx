import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Users, Store, Package, ShoppingBag, DollarSign, 
  AlertTriangle, ArrowRight, Settings, Tag, RotateCcw, FileText, CheckCircle2 
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashData, logsData] = await Promise.all([
          adminService.getDashboard(),
          adminService.getAuditLogs(0, 5).catch(() => ({ content: [] })),
        ]);
        setStats(dashData);
        setRecentLogs(logsData.content || []);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="container py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} /> Master Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Marketplace Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Platform metrics, vendor onboarding queue, order oversight, and revenue streams
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/sellers" className="btn btn-primary btn-sm font-bold flex items-center gap-1.5 shadow-sm">
            <Store size={15} /> Review Vendors
          </Link>
          <Link to="/admin/settings" className="btn btn-outline btn-sm font-semibold flex items-center gap-1.5">
            <Settings size={15} /> Settings
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading marketplace aggregates...</p>
        </div>
      ) : (
        <>
          {/* Pending Sellers Alert Banner */}
          {stats?.pendingSellers > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">
                    {stats.pendingSellers} Seller Application{stats.pendingSellers > 1 ? 's' : ''} Awaiting Approval
                  </h4>
                  <p className="text-xs text-amber-700">
                    New vendors have registered and require credential verification before their items go live.
                  </p>
                </div>
              </div>
              <Link
                to="/admin/sellers?status=PENDING"
                className="btn btn-sm bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 rounded-xl self-start sm:self-auto"
              >
                Review Applications
              </Link>
            </div>
          )}

          {/* Core Revenue KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">Total Platform GMV</span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                ₹{Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Cumulative customer sales volume</span>
            </div>

            <div className="card p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-sm">
              <span className="text-xs font-semibold text-emerald-800 block">Platform Commission Earned</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                ₹{Number(stats?.platformCommission || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Net marketplace platform fee</span>
            </div>

            <div className="card p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">Active Sellers</span>
              <div className="flex items-center justify-between mt-1">
                <p className="text-2xl font-black text-slate-900">{stats?.totalSellers || 0}</p>
                {stats?.pendingSellers > 0 && (
                  <span className="badge badge-warning text-[10px] font-bold">
                    {stats.pendingSellers} Pending
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Independent merchant partners</span>
            </div>

            <div className="card p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">Registered Buyers</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalBuyers || 0}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Active shopper consumer accounts</span>
            </div>
          </div>

          {/* Quick Operations Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/admin/orders" className="card card-hover p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">All Orders</span>
                <span className="text-[10px] text-slate-400">{stats?.totalOrders || 0} Total</span>
              </div>
            </Link>

            <Link to="/admin/products" className="card card-hover p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Product Catalog</span>
                <span className="text-[10px] text-slate-400">{stats?.totalProducts || 0} Listed</span>
              </div>
            </Link>

            <Link to="/admin/coupons" className="card card-hover p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Tag size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Discounts & Coupons</span>
                <span className="text-[10px] text-slate-400">Marketing rules</span>
              </div>
            </Link>

            <Link to="/admin/returns" className="card card-hover p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <RotateCcw size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Return Queue</span>
                <span className="text-[10px] text-slate-400">{stats?.totalRefunds || 0} Processed</span>
              </div>
            </Link>
          </div>

          {/* Recent Audit Trail */}
          <div className="card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Administrative Audit Trail</h2>
                <p className="text-xs text-slate-500">Recent security-logged actions across the platform</p>
              </div>
              <Link to="/admin/audit-logs" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                View Full Audit Trail <ArrowRight size={14} />
              </Link>
            </div>

            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No administrative audit logs recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Entity</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-indigo-700 font-mono">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {log.performedBy || 'System Admin'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {log.entityName} {log.entityId ? `#${log.entityId}` : ''}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-[280px] truncate">
                          {log.details}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
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
