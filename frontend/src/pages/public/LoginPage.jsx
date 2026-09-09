import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, ArrowRight, ShieldCheck, Store, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    try {
      setLoading(true);
      const data = await login({ email: email.trim(), password });
      showToast(`Welcome back, ${data.name}!`, 'success');

      // Redirect according to role or saved location
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

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    // Submit with credentials
    login({ email: demoEmail, password: demoPassword })
      .then((data) => {
        showToast(`Logged in as ${data.name}!`, 'success');
        if (from) {
          navigate(from, { replace: true });
        } else if (data.role === 'ROLE_ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else if (data.role === 'ROLE_SELLER') {
          navigate('/seller/dashboard', { replace: true });
        } else {
          navigate('/buyer/dashboard', { replace: true });
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Login failed';
        showToast(msg, 'error');
      });
  };

  return (
    <div className="container py-12 flex items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-black text-2xl text-slate-900 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <ShoppingBag size={20} />
            </div>
            <span>ROSHNA<span className="text-emerald-600">MART</span></span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Sign in to your account</h1>
          <p className="text-xs text-slate-500">Access buyer orders, seller dashboard, or admin controls</p>
        </div>

        {/* 1-CLICK DEMO ACCOUNTS QUICK LOGIN */}
        <div className="card p-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 space-y-2.5">
          <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>1-Click Test Demo Accounts</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('buyer@roshnamart.com', 'Buyer@123')}
              className="btn btn-outline btn-sm bg-white hover:bg-emerald-100 text-slate-800 text-[11px] font-bold py-1.5 px-2 rounded-lg flex flex-col items-center gap-1 border-emerald-300"
            >
              <UserCheck size={14} className="text-emerald-700" />
              <span>Buyer</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('techseller@roshnamart.com', 'Seller@123')}
              className="btn btn-outline btn-sm bg-white hover:bg-emerald-100 text-slate-800 text-[11px] font-bold py-1.5 px-2 rounded-lg flex flex-col items-center gap-1 border-emerald-300"
            >
              <Store size={14} className="text-emerald-700" />
              <span>Seller</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@roshnamart.com', 'Admin@123')}
              className="btn btn-outline btn-sm bg-white hover:bg-emerald-100 text-slate-800 text-[11px] font-bold py-1.5 px-2 rounded-lg flex flex-col items-center gap-1 border-emerald-300"
            >
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="card p-8 rounded-3xl border border-slate-200 bg-white shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
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
              className="btn btn-primary w-full py-3 rounded-xl font-bold shadow-md shadow-emerald-600/20 text-sm mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Registration Links */}
          <div className="pt-6 mt-6 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              New to RoshnaMart?{' '}
              <Link to="/register/buyer" className="font-bold text-emerald-600 hover:underline">
                Create a Buyer Account
              </Link>
            </p>
            <p className="text-xs text-slate-500">
              Want to sell products?{' '}
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
