import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle2, XCircle, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

export const AdminReturnsPage = () => {
  const { showToast } = useToast();

  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const data = await adminService.getReturns();
      setReturns(data.content || data || []);
    } catch (err) {
      console.error('Failed to load returns queue:', err);
      showToast('Failed to load return requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleProcessReturn = async (id, newStatus) => {
    try {
      setBusyId(id);
      await adminService.processReturn(id, newStatus);
      showToast(`Return #${id} updated to ${newStatus}`, 'success');
      fetchReturns();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to process return', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'REFUNDED':
        return <span className="badge badge-success text-[10px] uppercase font-bold">Refunded</span>;
      case 'APPROVED':
        return <span className="badge badge-info text-[10px] uppercase font-bold">Approved</span>;
      case 'REJECTED':
        return <span className="badge badge-danger text-[10px] uppercase font-bold">Rejected</span>;
      default:
        return <span className="badge badge-warning text-[10px] uppercase font-bold">Requested</span>;
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Buyer Returns & Refunds Queue</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer disputes, defective merchandise claims, and authorize refunds
        </p>
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading returns queue...</p>
        </div>
      ) : returns.length === 0 ? (
        <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <RotateCcw size={32} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">No active return requests</h3>
          <p className="text-xs text-slate-500">All customer return claims are currently up to date.</p>
        </div>
      ) : (
        <div className="card rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Claim ID</th>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Product / Buyer</th>
                  <th className="py-3.5 px-4">Reason & Explanation</th>
                  <th className="py-3.5 px-4">Claim Status</th>
                  <th className="py-3.5 px-4 text-right">Process Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.map((ret) => {
                  const isBusy = busyId === ret.id;
                  const status = ret.status || 'REQUESTED';

                  return (
                    <tr key={ret.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        RET-{ret.id}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-900 font-semibold">
                        {ret.orderNumber || (ret.order ? ret.order.orderNumber : `#${ret.orderId}`)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">
                          {ret.productName || ret.orderItem?.productName || 'Product item'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Buyer: {ret.buyerName || ret.buyer?.user?.name || 'Customer'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-[240px]">
                        <span className="font-bold text-slate-800 block uppercase tracking-wider text-[10px]">
                          {ret.reason}
                        </span>
                        <span className="text-slate-500 line-clamp-2">
                          {ret.comments || 'No explanation provided'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status === 'REQUESTED' && (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleProcessReturn(ret.id, 'APPROVED')}
                                className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleProcessReturn(ret.id, 'REJECTED')}
                                className="btn btn-outline btn-sm text-[11px] font-bold py-1 px-2 text-red-600 border-red-200 hover:bg-red-50 rounded-lg"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {status === 'APPROVED' && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleProcessReturn(ret.id, 'REFUNDED')}
                              className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 shadow-sm"
                            >
                              <DollarSign size={12} /> Issue Refund
                            </button>
                          )}

                          {status === 'REFUNDED' && (
                            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 justify-end">
                              <CheckCircle2 size={12} /> Refund Settled
                            </span>
                          )}

                          {status === 'REJECTED' && (
                            <span className="text-[11px] text-red-500 font-semibold justify-end">
                              Declined
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
