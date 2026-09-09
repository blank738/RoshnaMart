import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Store, User, Mail, Phone, Lock, FileText, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RegisterSellerPage = () => {
  const navigate = useNavigate();
  const { registerSeller } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessDescription: '',
    businessEmail: '',
    businessPhone: '',
    taxNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    try {
      setLoading(true);
      await registerSeller({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        businessName: formData.businessName,
        businessDescription: formData.businessDescription,
        businessEmail: formData.businessEmail || formData.email,
        businessPhone: formData.businessPhone || formData.phone,
        taxNumber: formData.taxNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      });

      showToast('Seller account registered! Admin will review your account for approval.', 'success');
      navigate('/seller/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register seller account. Email may already be in use.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 flex items-center justify-center min-h-[85vh]">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-black text-2xl text-slate-900 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <ShoppingBag size={20} />
            </div>
            <span>ROSHNA<span className="text-emerald-600">MART</span></span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
            <Store size={14} /> Partner With RoshnaMart
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Become a Verified Seller</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Sell directly to thousands of active buyers with automatic commission calculation and seamless payouts.
          </p>
        </div>

        <div className="card p-8 rounded-3xl border border-slate-200 bg-white shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Credentials */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <User size={16} className="text-emerald-600" /> Owner Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className="form-input text-sm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Login Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rahul@business.com"
                    className="form-input text-sm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Personal Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="form-input text-sm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleChange}
                    placeholder="29ABCDE1234F1Z5"
                    className="form-input text-sm uppercase"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Password *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="form-input text-sm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="form-input text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Store size={16} className="text-emerald-600" /> Business Details
              </h3>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label text-xs">Business / Brand Name *</label>
                  <input
                    type="text"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g. Apex Electronics Hub"
                    className="form-input text-sm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Business Description *</label>
                  <textarea
                    name="businessDescription"
                    rows={2}
                    required
                    value={formData.businessDescription}
                    onChange={handleChange}
                    placeholder="Describe the products you specialize in and your brand quality..."
                    className="form-input text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label text-xs">Business Support Email</label>
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleChange}
                      placeholder="support@apexhub.com"
                      className="form-input text-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">Business Support Phone</label>
                    <input
                      type="tel"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleChange}
                      placeholder="080-2345678"
                      className="form-input text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Store Address */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-emerald-600" /> Warehouse / Store Address
              </h3>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label text-xs">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="102 Silicon Valley Tech Park, Outer Ring Road"
                    className="form-input text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label text-xs">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Bangalore"
                      className="form-input text-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Karnataka"
                      className="form-input text-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="560100"
                      className="form-input text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
              <p className="font-bold">Verification Notice:</p>
              <p>
                To safeguard marketplace quality, newly registered seller accounts undergo quick administrative verification. Once approved by the admin team, your product listings will become publicly visible immediately.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-sm font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Register & Launch Store</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-6 mt-6 border-t border-slate-100 text-xs text-slate-500">
            Already have a seller account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:underline">
              Sign In to Seller Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
