import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, Filter, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { sellerService } from '../../services/sellerService';
import { useToast } from '../../context/ToastContext';

export const SellerOrdersPage = () => {
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async (p = 0) => {
    try {
      setLoading(true);
      const data = await sellerService.getOrders(p, 10);
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(p);
    } catch (err) {
      console.error('Failed to load seller orders:', err);
      showToast('Failed to load seller orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0);
  }, []);

  const handleStatusChange = async (orderItemId, newStatus) => {
    try {
      setUpdatingId(orderItemId);
      await sellerService.updateOrderItemStatus(orderItemId, newStatus);
      setOrders((prev) =>
        prev.map((item) => (item.id === orderItemId ? { ...item, itemStatus: newStatus } : item))
      );
      showToast(`Item status updated to ${newStatus}`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update item status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((item) => {
    if (activeFilter === 'ALL') return true;
    return (item.itemStatus || 'PROCESSING') === activeFilter;
  });

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Customer Orders</h1>
          <p className="text-xs text-slate-500 mt-1">
            Fulfill and update shipping status for customer items purchased from your store
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((tab) => (
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
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading order items...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Package size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No order items found</h3>
          <p className="text-xs text-slate-500">
            {activeFilter === 'ALL'
              ? 'You have not received any orders yet.'
              : `No orders currently in status "${activeFilter}".`}
          </p>
        </div>
      ) : (
        <div className="card rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Qty</th>
                  <th className="py-3.5 px-4">Customer Paid</th>
                  <th className="py-3.5 px-4">Commission (5%)</th>
                  <th className="py-3.5 px-4">Net Earning</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((item) => {
                  const isUpdating = updatingId === item.id;
                  const currentStatus = item.itemStatus || 'PROCESSING';
                  const commission = item.commissionAmount || (item.subtotal * 0.05);
                  const netEarning = item.sellerEarning || (item.subtotal - commission);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-800 block">
                          {item.orderNumber || `ORD-${item.id}`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : ''}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.productImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80'}
                            alt={item.productName}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block max-w-[200px] truncate">
                              {item.productName}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Unit: ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.quantity}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        ₹{Number(item.subtotal).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-amber-600 font-semibold">
                        -₹{Number(commission).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 font-black text-emerald-700">
                        ₹{Number(netEarning).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={currentStatus}
                          disabled={isUpdating || currentStatus === 'CANCELLED'}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`form-input py-1 px-2 text-xs font-bold rounded-lg border uppercase tracking-wider ${
                            currentStatus === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : currentStatus === 'SHIPPED'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : currentStatus === 'CANCELLED'
                              ? 'bg-red-50 text-red-800 border-red-300 cursor-not-allowed'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
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
                  onClick={() => fetchOrders(page - 1)}
                  className="btn btn-outline btn-sm px-2.5 py-1 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => fetchOrders(page + 1)}
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
