import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, CheckCircle2, Percent, Truck, RotateCcw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsPage = () => {
  const { showToast } = useToast();

  const [settings, setSettings] = useState({
    platformName: 'RoshnaMart',
    defaultCommissionPercentage: '5.00',
    deliveryCharge: '50.00',
    freeDeliveryThreshold: '500.00',
    minOrderAmount: '100.00',
    returnWindowDays: 7,
    sellerApprovalRequired: true,
    productApprovalRequired: false,
    codEnabled: true,
    onlinePaymentEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminService.getSettings()
      .then((data) => {
        if (data) {
          setSettings({
            platformName: data.platformName || 'RoshnaMart',
            defaultCommissionPercentage: data.defaultCommissionPercentage || '5.00',
            deliveryCharge: data.deliveryCharge || '50.00',
            freeDeliveryThreshold: data.freeDeliveryThreshold || '500.00',
            minOrderAmount: data.minOrderAmount || '100.00',
            returnWindowDays: data.returnWindowDays || 7,
            sellerApprovalRequired: data.sellerApprovalRequired ?? true,
            productApprovalRequired: data.productApprovalRequired ?? false,
            codEnabled: data.codEnabled ?? true,
            onlinePaymentEnabled: data.onlinePaymentEnabled ?? true,
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...settings,
        defaultCommissionPercentage: Number(settings.defaultCommissionPercentage),
        deliveryCharge: Number(settings.deliveryCharge),
        freeDeliveryThreshold: Number(settings.freeDeliveryThreshold),
        minOrderAmount: Number(settings.minOrderAmount),
        returnWindowDays: Number(settings.returnWindowDays),
      };

      await adminService.updateSettings(payload);
      showToast('Marketplace settings updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Loading marketplace configuration...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 max-w-4xl">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Platform Settings & Policies</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure default seller commission cuts, delivery thresholds, and transaction gateways
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Marketplace Identity & Commission */}
        <div className="card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Percent size={16} className="text-emerald-600" /> Platform & Commission Model
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label text-xs">Marketplace Brand Name *</label>
              <input
                type="text"
                name="platformName"
                required
                value={settings.platformName}
                onChange={handleChange}
                className="form-input text-xs"
              />
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Default Seller Commission (%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                name="defaultCommissionPercentage"
                required
                value={settings.defaultCommissionPercentage}
                onChange={handleChange}
                placeholder="5.00"
                className="form-input text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Automatically deducted from every seller order line item
              </span>
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Fee Thresholds */}
        <div className="card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Truck size={16} className="text-emerald-600" /> Logistics & Delivery Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label text-xs">Standard Delivery Charge (₹) *</label>
              <input
                type="number"
                step="1"
                min="0"
                name="deliveryCharge"
                required
                value={settings.deliveryCharge}
                onChange={handleChange}
                placeholder="50"
                className="form-input text-xs"
              />
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Free Delivery Threshold (₹) *</label>
              <input
                type="number"
                step="1"
                min="0"
                name="freeDeliveryThreshold"
                required
                value={settings.freeDeliveryThreshold}
                onChange={handleChange}
                placeholder="500"
                className="form-input text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Orders with subtotal above this get free shipping
              </span>
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Customer Return Window (Days) *</label>
              <input
                type="number"
                min="1"
                max="60"
                name="returnWindowDays"
                required
                value={settings.returnWindowDays}
                onChange={handleChange}
                placeholder="7"
                className="form-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* Operational Guardrails & Feature Toggles */}
        <div className="card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" /> Compliance & Payment Switches
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition">
              <div>
                <span className="font-bold text-xs text-slate-900 block">Require Seller Approval</span>
                <span className="text-[10px] text-slate-500">
                  New vendor registrations start in PENDING state
                </span>
              </div>
              <input
                type="checkbox"
                name="sellerApprovalRequired"
                checked={settings.sellerApprovalRequired}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
              />
            </label>

            <label className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition">
              <div>
                <span className="font-bold text-xs text-slate-900 block">Require Product Approval</span>
                <span className="text-[10px] text-slate-500">
                  New product listings require admin review
                </span>
              </div>
              <input
                type="checkbox"
                name="productApprovalRequired"
                checked={settings.productApprovalRequired}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
              />
            </label>

            <label className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition">
              <div>
                <span className="font-bold text-xs text-slate-900 block">Cash on Delivery (COD)</span>
                <span className="text-[10px] text-slate-500">
                  Allow shoppers to pay on package arrival
                </span>
              </div>
              <input
                type="checkbox"
                name="codEnabled"
                checked={settings.codEnabled}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
              />
            </label>

            <label className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition">
              <div>
                <span className="font-bold text-xs text-slate-900 block">Online Payment Gateway</span>
                <span className="text-[10px] text-slate-500">
                  Enable mock/online digital payments
                </span>
              </div>
              <input
                type="checkbox"
                name="onlinePaymentEnabled"
                checked={settings.onlinePaymentEnabled}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary px-8 py-3 text-sm font-bold rounded-xl shadow-lg flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Policies...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Platform Rules</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
