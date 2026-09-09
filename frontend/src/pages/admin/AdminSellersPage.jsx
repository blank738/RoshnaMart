import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Store, CheckCircle2, XCircle, AlertTriangle, RefreshCw, 
  Search, ShieldCheck, Mail, Phone, MapPin, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';

export const AdminSellersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const initialStatus = searchParams.get('status') || 'ALL';
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSellers = async (p = 0, statusFilter = activeTab, query = searchTerm) => {
    try {
      setLoading(true);
      const params = {
        page: p,
        size: 10,
      };
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (query.trim()) {
        params.search = query.trim();
      }

      const data = await adminService.getSellers(params);
      setSellers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(p);
    } catch (err) {
      console.error('Failed to load sellers:', err);
      showToast('Failed to load seller directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers(0, activeTab, searchTerm);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'ALL' ? {} : { status: tab });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSellers(0, activeTab, searchTerm);
  };

  const handleApprove = async (id, name) => {
    try {
      setActionLoadingId(id);
      await adminService.approveSeller(id);
      showToast(`Seller "${name}" approved successfully!`, 'success');
      fetchSellers(page, activeTab, searchTerm);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve seller', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = (id, name) => {
    setConfirmAction({
      type: 'REJECT',
      id,
      name,
      title: 'Reject Seller Registration?',
      message: `Are you sure you want to reject the seller application for "${name}"?`,
      confirmText: 'Reject Application',
      isDestructive: true,
    });
  };

  const handleSuspend = (id, name) => {
    setConfirmAction({
      type: 'SUSPEND',
      id,
      name,
      title: 'Suspend Seller Account?',
      message: `Suspend store "${name}"? Their products will immediately be hidden from buyers.`,
      confirmText: 'Suspend Store',
      isDestructive: true,
    });
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, id, name } = confirmAction;

    try {
      setActionLoadingId(id);
      if (type === 'REJECT') {
        await adminService.rejectSeller(id);
        showToast(`Seller "${name}" application rejected`, 'info');
      } else if (type === 'SUSPEND') {
        await adminService.suspendSeller(id);
        showToast(`Seller "${name}" store suspended`, 'warning');
      }
      setConfirmAction(null);
      fetchSellers(page, activeTab, searchTerm);
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to process ${type.toLowerCase()}`, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReactivate = async (id, name) => {
    try {
      setActionLoadingId(id);
      await adminService.reactivateSeller(id);
      showToast(`Seller "${name}" reactivated!`, 'success');
      fetchSellers(page, activeTab, searchTerm);
    } catch (err) {
      showToast('Failed to reactivate seller', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge badge-success text-[10px] uppercase font-bold">Approved</span>;
      case 'PENDING':
        return <span className="badge badge-warning text-[10px] uppercase font-bold">Pending Review</span>;
      case 'REJECTED':
        return <span className="badge badge-danger text-[10px] uppercase font-bold">Rejected</span>;
      case 'SUSPENDED':
        return <span className="badge badge-danger text-[10px] uppercase font-bold">Suspended</span>;
      default:
        return <span className="badge badge-info text-[10px] uppercase font-bold">{status}</span>;
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Seller Verification & Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review new merchant applications, authorize access, and manage store operational statuses
          </p>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab === 'PENDING' ? 'Pending Approval' : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search business or owner name..."
            className="form-input text-xs py-1.5"
          />
          <button type="submit" className="btn btn-outline btn-sm text-xs font-bold">
            <Search size={14} />
          </button>
        </form>
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading sellers directory...</p>
        </div>
      ) : sellers.length === 0 ? (
        <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Store size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No sellers found</h3>
          <p className="text-xs text-slate-500">
            No merchant accounts match the current filter or search criteria.
          </p>
        </div>
      ) : (
        <div className="card rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Business / Merchant</th>
                  <th className="py-3.5 px-4">Owner Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Tax ID / GSTIN</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellers.map((seller) => {
                  const isActionBusy = actionLoadingId === seller.id;
                  const status = seller.verificationStatus;

                  return (
                    <tr key={seller.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block max-w-[200px] truncate">
                            {seller.businessName}
                          </span>
                          <span className="text-[10px] text-slate-400 block max-w-[220px] truncate">
                            {seller.businessDescription}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {seller.user?.name || 'Owner'}
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <span className="text-slate-700 block truncate max-w-[150px]">
                          {seller.businessEmail || seller.user?.email}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {seller.businessPhone || seller.user?.phone}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {seller.city}, {seller.state}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">
                        {seller.taxNumber || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                disabled={isActionBusy}
                                onClick={() => handleApprove(seller.id, seller.businessName)}
                                className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 shadow-sm"
                              >
                                <CheckCircle2 size={12} /> Approve
                              </button>
                              <button
                                type="button"
                                disabled={isActionBusy}
                                onClick={() => handleReject(seller.id, seller.businessName)}
                                className="btn btn-outline btn-sm text-[11px] font-bold py-1 px-2 text-red-600 border-red-200 hover:bg-red-50 rounded-lg flex items-center gap-1"
                              >
                                <XCircle size={12} /> Reject
                              </button>
                            </>
                          )}

                          {status === 'APPROVED' && (
                            <button
                              type="button"
                              disabled={isActionBusy}
                              onClick={() => handleSuspend(seller.id, seller.businessName)}
                              className="btn btn-outline btn-sm text-[11px] font-bold py-1 px-2 text-amber-700 border-amber-300 hover:bg-amber-50 rounded-lg"
                            >
                              Suspend Store
                            </button>
                          )}

                          {status === 'SUSPENDED' && (
                            <button
                              type="button"
                              disabled={isActionBusy}
                              onClick={() => handleReactivate(seller.id, seller.businessName)}
                              className="btn btn-primary btn-sm text-[11px] font-bold py-1 px-2.5 rounded-lg"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
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
                Page {page + 1} of {totalPages} ({totalElements} total)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => fetchSellers(page - 1)}
                  className="btn btn-outline btn-sm px-2.5 py-1 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => fetchSellers(page + 1)}
                  className="btn btn-outline btn-sm px-2.5 py-1 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirm Action Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmText={confirmAction?.confirmText}
        isDestructive={confirmAction?.isDestructive}
        isLoading={Boolean(actionLoadingId)}
        onConfirm={executeConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};
