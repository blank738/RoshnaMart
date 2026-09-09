import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle2, XCircle, Clock, Percent, DollarSign, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';

export const AdminCouponsPage = () => {
  const { showToast } = useToast();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '100',
    expiryDate: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCoupons();
      setCoupons(data || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
      showToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      showToast('Please specify coupon code and discount value', 'warning');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : null,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        expiryDate: formData.expiryDate ? `${formData.expiryDate}T23:59:59` : null,
      };

      await adminService.createCoupon(payload);
      showToast(`Coupon ${payload.code} created successfully!`, 'success');
      setModalOpen(false);
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        usageLimit: '100',
        expiryDate: '',
      });
      fetchCoupons();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id, currentActive) => {
    try {
      const nextStatus = !currentActive;
      await adminService.updateCouponStatus(id, nextStatus);
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: nextStatus } : c))
      );
      showToast(`Coupon ${nextStatus ? 'activated' : 'deactivated'}`, 'info');
    } catch (err) {
      showToast('Failed to toggle coupon status', 'error');
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Discount Coupons & Offers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure marketplace promotional discount vouchers, cart thresholds, and expiry windows
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn btn-primary btn-sm font-bold flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} /> Create Coupon Code
        </button>
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading coupons catalog...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Tag size={32} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">No coupons active</h3>
          <p className="text-xs text-slate-500">Create your first marketplace coupon to incentivize shoppers!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => {
            const isPercentage = coupon.discountType === 'PERCENTAGE';

            return (
              <div
                key={coupon.id}
                className="card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-base text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 tracking-wider">
                      {coupon.code}
                    </span>
                    <span
                      className={`badge text-[10px] uppercase font-bold ${
                        coupon.active ? 'badge-success' : 'badge-danger'
                      }`}
                    >
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-emerald-700">
                    {isPercentage ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p>
                      Min Order Spend: <span className="font-bold">₹{coupon.minOrderAmount || 0}</span>
                    </p>
                    {coupon.maxDiscountAmount && (
                      <p>
                        Max Discount Cap: <span className="font-bold">₹{coupon.maxDiscountAmount}</span>
                      </p>
                    )}
                    <p>
                      Usage: <span className="font-bold">{coupon.usedCount || 0}</span> /{' '}
                      <span className="font-bold">{coupon.usageLimit || '∞'}</span> used
                    </p>
                    {coupon.expiryDate && (
                      <p className="text-slate-400 text-[11px] flex items-center gap-1 pt-1">
                        <Clock size={12} />
                        Expires: {new Date(coupon.expiryDate).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(coupon.id, coupon.active)}
                    className={`btn btn-outline btn-sm text-xs font-bold py-1 px-3 rounded-lg ${
                      coupon.active
                        ? 'text-red-600 border-red-200 hover:bg-red-50'
                        : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    {coupon.active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Promotional Coupon"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div className="form-group">
            <label className="form-label text-xs">Coupon Code (Uppercase) *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. FESTIVE25"
              className="form-input text-xs font-mono uppercase tracking-wider"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-xs">Discount Type *</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="form-input text-xs"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Discount Value *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 200'}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-xs">Min Order Amount (₹)</label>
              <input
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                placeholder="e.g. 500"
                className="form-input text-xs"
              />
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Max Discount Cap (₹)</label>
              <input
                type="number"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                placeholder="e.g. 1000"
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-xs">Total Usage Limit</label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="100"
                className="form-input text-xs"
              />
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-outline btn-sm text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-sm text-xs font-bold"
            >
              {saving ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
