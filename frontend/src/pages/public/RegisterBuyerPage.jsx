import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RegisterBuyerPage = () => {
  const navigate = useNavigate();
  const { registerBuyer } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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
      const data = await registerBuyer(formData);
      showToast(`Account created! Welcome, ${data.name}!`, 'success');
      navigate('/buyer/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Email may already be in use.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 flex items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-black text-2xl text-slate-900 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <ShoppingBag size={20} />
            </div>
            <span>ROSHNA<span className="text-emerald-600">MART</span></span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Create Buyer Account</h1>
          <p className="text-xs text-slate-500">Join RoshnaMart to order from verified merchants</p>
        </div>

        <div className="card p-8 rounded-3xl border border-slate-200 bg-white shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="form-input text-sm pl-10"
                />
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="form-input text-sm pl-10"
                />
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="form-input text-sm pl-10"
                />
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="form-input text-sm pl-10"
                />
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="form-input text-sm pl-10"
                />
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 rounded-xl font-bold shadow-md shadow-emerald-600/20 text-sm mt-2"
            >
              {loading ? 'Creating Account...' : 'Register as Buyer'}
            </button>
          </form>

          <div className="pt-6 mt-6 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-emerald-600 hover:underline">
                Sign In
              </Link>
            </p>
            <p className="text-xs text-slate-500">
              Want to sell on RoshnaMart?{' '}
              <Link to="/register/seller" className="font-bold text-emerald-600 hover:underline">
                Register as Merchant
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
