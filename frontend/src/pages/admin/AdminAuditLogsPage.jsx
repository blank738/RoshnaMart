import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

export const AdminAuditLogsPage = () => {
  const { showToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchLogs = async (p = 0) => {
    try {
      setLoading(true);
      const data = await adminService.getAuditLogs(p, 15);
      setLogs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(p);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      showToast('Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  }, []);

  return (
    <div className="container py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Administrative Audit Trail</h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically recorded historical trail of admin actions, vendor approvals, and policy adjustments
        </p>
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading audit history...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <FileText size={32} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">No audit events logged yet</h3>
        </div>
      ) : (
        <div className="card rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Event / Action</th>
                  <th className="py-3.5 px-4">Admin Performed By</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Activity Details</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {log.performedBy || 'System Admin'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {log.entityName} {log.entityId ? `#${log.entityId}` : ''}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-[320px]">
                      {log.details}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })
                        : 'Recorded'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Page {page + 1} of {totalPages} ({totalElements} events)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => fetchLogs(page - 1)}
                  className="btn btn-outline btn-sm px-2.5 py-1 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => fetchLogs(page + 1)}
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
