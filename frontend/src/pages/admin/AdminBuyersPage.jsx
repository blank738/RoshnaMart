import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, CheckCircle2, XCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

export const AdminBuyersPage = () => {
  const { showToast } = useToast();

  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchBuyers = async (p = 0) => {
    try {
      setLoading(true);
      const data = await adminService.getBuyers(p, 10);
      setBuyers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(p);
    } catch (err) {
      console.error('Failed to load buyers:', err);
      showToast('Failed to load buyers list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers(0);
  }, []);

  const handleToggleStatus = async (user, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      setActionLoadingId(user.id);
      await adminService.updateUserStatus(user.id, newStatus);
      setBuyers((prev) =>
        prev.map((b) =>
          b.user?.id === user.id
            ? { ...b, user: { ...b.user, status: newStatus } }
            : b.id === user.id
            ? { ...b, status: newStatus }
            : b
        )
      );
      showToast(`User account ${newStatus.toLowerCase()} successfully`, 'success');
    } catch (err) {
      showToast('Failed to update buyer status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Registered Buyers</h1>
        <p className="text-xs text-slate-500 mt-1">
          {totalElements} registered shopper accounts on RoshnaMart
        </p>
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading buyers list...</p>
        </div>
      ) : buyers.length === 0 ? (
        <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Users size={32} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">No buyer accounts found</h3>
        </div>
      ) : (
        <div className="card rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Buyer Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Registration Date</th>
                  <th className="py-3.5 px-4 text-right">Account Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buyers.map((b) => {
                  const u = b.user || b;
                  const isBusy = actionLoadingId === u.id;
                  const status = u.status || 'ACTIVE';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {u.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {u.phone || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`badge text-[10px] font-bold uppercase ${
                            status === 'ACTIVE' ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'Member'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleStatus(u, status)}
                          className={`btn btn-outline btn-sm text-[11px] font-bold py-1 px-2.5 rounded-lg ${
                            status === 'ACTIVE'
                              ? 'text-red-600 border-red-200 hover:bg-red-50'
                              : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          {status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => fetchBuyers(page - 1)}
                  className="btn btn-outline btn-sm px-2.5 py-1 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => fetchBuyers(page + 1)}
                  className="btn btn-outline btn-sm px-2.5 py-1 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
