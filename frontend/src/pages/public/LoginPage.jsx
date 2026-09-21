import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, Store, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();
  const { showToast } = useToast();

  // Selected flow: 'BUYER' or 'SELLER'
  const [loginRole, setLoginRole] = useState(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('role') === 'seller' || location.state?.role === 'seller') {
      return 'SELLER';
    }
    return 'BUYER';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  // Clear fields if switching between login roles
  const handleRoleSwitch = (role) => {
    setLoginRole(role);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    try {
      setLoading(true);
      const data = await login({ email: email.trim(), password });

      // Role check for clean separation between Buyer and Seller flows
      if (loginRole === 'BUYER' && data.role === 'ROLE_SELLER') {
        logout();
        showToast('This account is registered as a Seller. Please select "Login as Seller" to proceed.', 'warning');
        return;
      }

      if (loginRole === 'SELLER' && data.role === 'ROLE_BUYER') {
        logout();
        showToast('This account is registered as a Buyer. Please select "Login as Buyer" to proceed.', 'warning');
        return;
      }

      showToast(`Welcome back, ${data.name}!`, 'success');

      // Navigate to respective dashboard or requested URL
      if (from) {
        navigate(from, { replace: true });
      } else if (data.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (data.role === 'ROLE_SELLER') {
        navigate('/seller/dashboard', { replace: true });
      } else {
        navigate('/buyer/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 flex items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-black text-2xl text-slate-900 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <ShoppingBag size={20} />
            </div>
            <span>ROSHNA<span className="text-emerald-600">MART</span></span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {loginRole === 'BUYER' ? 'Sign In as Buyer' : 'Sign In as Seller'}
          </h1>
          <p className="text-xs text-slate-500">
            {loginRole === 'BUYER'
              ? 'Access your customer orders, track multi-vendor deliveries, and view wishlist'
              : 'Access your merchant portal, manage product catalog, and fulfill customer orders'}
          </p>
        </div>

        {/* TWO CLEAR CHOICES: Option 1 (Buyer) vs Option 2 (Seller) */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 gap-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => handleRoleSwitch('BUYER')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              loginRole === 'BUYER'
                ? 'bg-white text-emerald-700 shadow-md shadow-slate-200 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <UserCheck size={16} className={loginRole === 'BUYER' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Login as Buyer</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSwitch('SELLER')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              loginRole === 'SELLER'
                ? 'bg-white text-emerald-700 shadow-md shadow-slate-200 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Store size={16} className={loginRole === 'SELLER' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Login as Seller</span>
          </button>
        </div>

        {/* Authentication Form Card */}
        <div className="card p-8 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              {loginRole === 'BUYER' ? 'Customer Account' : 'Merchant Portal'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {loginRole === 'BUYER' ? 'Buyer Access' : 'Seller Access'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={loginRole === 'BUYER' ? 'buyer@example.com' : 'merchant@example.com'}
                  className="form-input text-sm pl-10"
                />
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input text-sm pl-10"
                />
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 rounded-xl font-bold shadow-md shadow-emerald-600/20 text-sm mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as {loginRole === 'BUYER' ? 'Buyer' : 'Seller'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Registration Navigation Links */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            {loginRole === 'BUYER' ? (
              <p className="text-xs text-slate-500">
                New shopper on RoshnaMart?{' '}
                <Link to="/register/buyer" className="font-bold text-emerald-600 hover:underline">
                  Create a Buyer Account
                </Link>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Interested in selling on RoshnaMart?{' '}
                <Link to="/register/seller" className="font-bold text-emerald-600 hover:underline">
                  Register as Merchant
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
