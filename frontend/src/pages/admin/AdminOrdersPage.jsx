import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye, Store, Package, MapPin, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';

export const AdminOrdersPage = () => {
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Order inspection modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectedOrder, setInspectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async (p = 0) => {
    try {
      setLoading(true);
      const data = await adminService.getOrders(p, 10);
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(p);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
      showToast('Failed to load marketplace orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0);
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      if (inspectedOrder?.id === orderId) {
        setInspectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
      showToast(`Order status set to ${newStatus}`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
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
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Marketplace Orders</h1>
          <p className="text-xs text-slate-500 mt-1">
            {totalElements} total multi-vendor customer orders processed
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading marketplace orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <ShoppingBag size={32} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">No orders recorded yet</h3>
        </div>
      ) : (
        <div className="card rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items Count</th>
                  <th className="py-3.5 px-4">Gross GMV</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {order.orderNumber}
                      <span className="text-[10px] text-slate-400 block font-sans">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : ''}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{order.buyerName}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
                        {order.buyerEmail}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {order.items?.length || 0} items
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ₹{Number(order.finalAmount).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 uppercase block">
                        {order.paymentMethod}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold uppercase">
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`badge ${getStatusBadge(order.orderStatus)} text-[10px] uppercase font-bold`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setInspectedOrder(order);
                          setInspectModalOpen(true);
                        }}
                        className="btn btn-outline btn-sm text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 inline-flex"
                      >
                        <Eye size={13} /> Inspect
                      </button>
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

      {/* Inspect Order Details Modal */}
      <Modal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        title={`Order Oversight: ${inspectedOrder?.orderNumber}`}
        maxWidth="max-w-2xl"
      >
        {inspectedOrder && (
          <div className="space-y-6 text-xs">
            {/* Status Change Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <span className="text-slate-400 block font-semibold">Override Status</span>
                <span className="font-bold text-slate-800">Current: {inspectedOrder.orderStatus}</span>
              </div>
              <select
                value={inspectedOrder.orderStatus}
                disabled={updatingStatus}
                onChange={(e) => handleUpdateOrderStatus(inspectedOrder.id, e.target.value)}
                className="form-input py-1 px-3 text-xs font-bold rounded-lg border uppercase tracking-wider max-w-[180px]"
              >
                <option value="PLACED">PLACED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Itemized Sellers Breakdown */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                Multi-Seller Items ({inspectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {inspectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between bg-white">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 block">{item.productName}</span>
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Store size={11} className="text-emerald-600" />
                        <span>Vendor: {item.sellerBusinessName}</span>
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        Qty: {item.quantity} × ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">
                        ₹{Number(item.subtotal).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold block">
                        Commission: ₹{Number(item.commissionAmount || (item.subtotal * 0.05)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Address */}
            {inspectedOrder.shippingAddress && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block flex items-center gap-1">
                  <MapPin size={12} /> Shipping Destination
                </span>
                <p className="font-bold text-slate-800">{inspectedOrder.shippingAddress.streetAddress}</p>
                <p className="text-slate-500">
                  {inspectedOrder.shippingAddress.city}, {inspectedOrder.shippingAddress.state} - {inspectedOrder.shippingAddress.pincode}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
