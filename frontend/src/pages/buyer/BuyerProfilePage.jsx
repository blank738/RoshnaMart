import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Plus, Trash2, Edit2, Star, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import { Modal } from '../../components/Modal';
import { ConfirmModal } from '../../components/ConfirmModal';

export const BuyerProfilePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Address modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'HOME',
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState(null);
  const [deletingAddress, setDeletingAddress] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const data = await orderService.getAddresses();
      setAddresses(data || []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenAdd = () => {
    setEditingAddressId(null);
    setAddressForm({
      streetAddress: '',
      city: '',
      state: '',
      pincode: '',
      addressType: 'HOME',
      isDefault: addresses.length === 0,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      streetAddress: addr.streetAddress,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      addressType: addr.addressType || 'HOME',
      isDefault: addr.isDefault || false,
    });
    setModalOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingAddressId) {
        await orderService.updateAddress(editingAddressId, addressForm);
        showToast('Address updated successfully', 'success');
      } else {
        await orderService.addAddress(addressForm);
        showToast('Address added successfully', 'success');
      }
      setModalOpen(false);
      fetchAddresses();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = (id) => {
    setDeleteAddressId(id);
  };

  const confirmDeleteAddress = async () => {
    if (!deleteAddressId) return;
    try {
      setDeletingAddress(true);
      await orderService.deleteAddress(deleteAddressId);
      setAddresses((prev) => prev.filter((a) => a.id !== deleteAddressId));
      showToast('Address deleted', 'info');
      setDeleteAddressId(null);
    } catch (err) {
      showToast('Failed to delete address', 'error');
    } finally {
      setDeletingAddress(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await orderService.setDefaultAddress(id);
      showToast('Default address updated', 'success');
      fetchAddresses();
    } catch (err) {
      showToast('Failed to set default address', 'error');
    }
  };

  return (
    <div className="container py-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Account & Addresses</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details and saved shipping destinations
        </p>
      </div>

      {/* Personal Info Profile Card */}
      <div className="card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <User size={16} className="text-emerald-600" />
          <span>Profile Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block">Full Name</span>
            <span className="font-bold text-sm text-slate-900 mt-0.5 block">{user?.name}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block">Email Address</span>
            <span className="font-bold text-sm text-slate-900 mt-0.5 block truncate">{user?.email}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block">Phone Number</span>
            <span className="font-bold text-sm text-slate-900 mt-0.5 block">{user?.phone || 'Not provided'}</span>
          </div>
        </div>
      </div>

      {/* Address Book Card */}
      <div className="card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MapPin size={16} className="text-emerald-600" />
            <span>Saved Delivery Addresses ({addresses.length})</span>
          </h2>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5"
          >
            <Plus size={14} /> Add New Address
          </button>
        </div>

        {loadingAddresses ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading your address book...</div>
        ) : addresses.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
            <p className="text-sm text-slate-600">No delivery addresses saved yet.</p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="btn btn-primary btn-sm text-xs"
            >
              Add First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-info text-[10px] font-bold uppercase">
                      {addr.addressType || 'HOME'}
                    </span>
                    {addr.isDefault ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[10px] font-bold text-slate-500 hover:text-emerald-600"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-900 pt-1">
                    {addr.streetAddress}
                  </p>
                  <p className="text-xs text-slate-600">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(addr)}
                    className="text-slate-600 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition flex items-center gap-1 font-semibold"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition flex items-center gap-1 font-semibold"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAddressId ? 'Edit Delivery Address' : 'Add New Address'}
      >
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <div className="form-group">
            <label className="form-label text-xs">Street Address / Landmark *</label>
            <input
              type="text"
              required
              value={addressForm.streetAddress}
              onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
              placeholder="House/Flat No., Road name, Landmark"
              className="form-input text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-xs">City *</label>
              <input
                type="text"
                required
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                placeholder="Bangalore"
                className="form-input text-xs"
              />
            </div>
            <div className="form-group">
              <label className="form-label text-xs">State *</label>
              <input
                type="text"
                required
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                placeholder="Karnataka"
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-xs">Pincode *</label>
              <input
                type="text"
                required
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                placeholder="560100"
                className="form-input text-xs"
              />
            </div>
            <div className="form-group">
              <label className="form-label text-xs">Address Type</label>
              <select
                value={addressForm.addressType}
                onChange={(e) => setAddressForm({ ...addressForm, addressType: e.target.value })}
                className="form-input text-xs"
              >
                <option value="HOME">Home</option>
                <option value="WORK">Work</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="profileDefAddrCheck"
              checked={addressForm.isDefault}
              onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
              className="rounded text-emerald-600"
            />
            <label htmlFor="profileDefAddrCheck" className="text-xs text-slate-700 cursor-pointer">
              Set as my default delivery address
            </label>
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
              {saving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Address Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteAddressId}
        onClose={() => setDeleteAddressId(null)}
        onConfirm={confirmDeleteAddress}
        title="Remove Saved Address?"
        message="Are you sure you want to delete this delivery address from your profile? This cannot be undone."
        confirmText="Delete Address"
        cancelText="Keep"
        isDestructive={true}
        loading={deletingAddress}
      />
    </div>
  );
};
