import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Package, Star, ShieldCheck, PieChart, ArrowUpRight } from 'lucide-react';
import { sellerService } from '../../services/sellerService';

export const SellerAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerService.getDashboard()
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const gross = Number(stats?.grossRevenue || 0);
  const commission = Number(stats?.commission || 0);
  const net = Number(stats?.netEarnings || 0);

  const netPercent = gross > 0 ? Math.round((net / gross) * 100) : 95;
  const commissionPercent = gross > 0 ? Math.round((commission / gross) * 100) : 5;

  return (
    <div className="container py-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Financial & Sales Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed breakdown of your store revenue, platform fee deductions, and operational health
        </p>
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Calculating revenue analytics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Visual Progress / Distribution Card */}
          <div className="card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <PieChart size={16} className="text-emerald-600" />
              <span>Revenue Distribution Breakdown</span>
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-700">Net Seller Payout ({netPercent}%)</span>
                <span className="text-amber-600">Platform Commission ({commissionPercent}%)</span>
              </div>
              <div className="w-full h-4 bg-amber-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-600 h-full transition-all duration-700"
                  style={{ width: `${netPercent}%` }}
                ></div>
                <div
                  className="bg-amber-500 h-full transition-all duration-700"
                  style={{ width: `${commissionPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 block font-semibold">Total Gross GMV</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">
                  ₹{gross.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">100% of customer order volume</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                <span className="text-xs text-amber-800 block font-semibold">
                  Platform Fee ({stats?.commissionPercentage != null ? `${stats.commissionPercentage}%` : `${commissionPercent}%`})
                </span>
                <span className="text-xl font-black text-amber-700 mt-1 block">
                  -₹{commission.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-700 mt-1 block">Transparent marketplace commission</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-xs text-emerald-800 block font-semibold">Net Earnings</span>
                <span className="text-xl font-black text-emerald-700 mt-1 block">
                  ₹{net.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-700 mt-1 block">Ready for bank transfer</span>
              </div>
            </div>
          </div>

          {/* Operational Benchmarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Star size={16} className="text-amber-500" /> Store Reputation
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-2xl">
                  {stats?.averageRating ? Number(stats.averageRating).toFixed(1) : '5.0'}
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 block">Top Rated Vendor Status</span>
                  <p className="text-xs text-slate-500">
                    Calculated automatically from verified purchases and buyer reviews. High ratings boost your product ranking in marketplace search!
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" /> Account Health
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Verification Status</span>
                  <span className="badge badge-success text-[10px] uppercase font-bold">
                    {stats?.verificationStatus || 'APPROVED'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Out of Stock Ratio</span>
                  <span className="font-bold text-slate-800">
                    {stats?.totalProducts > 0
                      ? `${Math.round((stats.outOfStockProducts / stats.totalProducts) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Commission Plan</span>
                  <span className="font-bold text-emerald-700">
                    {stats?.commissionPercentage != null ? `${stats.commissionPercentage}% Rate` : 'Marketplace Rate'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
