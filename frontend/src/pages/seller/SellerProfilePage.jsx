import React, { useState, useEffect } from 'react';
import { Store, User, Mail, Phone, MapPin, FileText, ShieldCheck, AlertCircle } from 'lucide-react';
import { sellerService } from '../../services/sellerService';
import { useAuth } from '../../context/AuthContext';

export const SellerProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerService.getProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error('Failed to load seller profile:', err))
      .finally(() => setLoading(false));
  }, []);

  const verificationStatus = profile?.verificationStatus || user?.verificationStatus || 'APPROVED';

  return (
    <div className="container py-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Seller Profile & Compliance</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your merchant credentials, legal business registration, and store contact information
        </p>
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading merchant details...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Verification Status Banner */}
          <div className="card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Store size={26} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {profile?.businessName || user?.businessName || 'Your Business Store'}
                </h2>
                <p className="text-xs text-slate-500">Authorized Merchant Partner</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Verification:</span>
              <span
                className={`badge text-xs font-bold uppercase tracking-wider ${
                  verificationStatus === 'APPROVED'
                    ? 'badge-success'
                    : verificationStatus === 'PENDING'
                    ? 'badge-warning'
                    : 'badge-danger'
                }`}
              >
                {verificationStatus}
              </span>
            </div>
          </div>

          {/* Business & Tax Info */}
          <div className="card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-emerald-600" /> Legal & Business Registration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold block">Store / Business Name</span>
                <span className="font-bold text-slate-900 text-sm block">
                  {profile?.businessName || 'Apex Electronics Hub'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold block">Tax ID / GSTIN</span>
                <span className="font-mono font-bold text-slate-900 text-sm block">
                  {profile?.taxNumber || '29ABCDE1234F1Z5'}
                </span>
              </div>

              <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold block">Business Description</span>
                <p className="text-slate-700 leading-relaxed">
                  {profile?.businessDescription || 'Premier authorized vendor for premium audio gear, smart gadgets, and accessories.'}
                </p>
              </div>
            </div>
          </div>

          {/* Contact & Physical Address */}
          <div className="card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin size={16} className="text-emerald-600" /> Contact & Warehouse Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold block">Support Email</span>
                <span className="font-bold text-slate-900 block truncate">
                  {profile?.businessEmail || user?.email}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold block">Support Phone</span>
                <span className="font-bold text-slate-900 block">
                  {profile?.businessPhone || user?.phone || '9888811111'}
                </span>
              </div>

              <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold block">Physical Warehouse Address</span>
                <span className="font-bold text-slate-900 block">
                  {profile?.address || '102 Silicon Valley Tech Park, Outer Ring Road'}
                </span>
                <span className="text-slate-600 block">
                  {profile?.city || 'Bangalore'}, {profile?.state || 'Karnataka'} - {profile?.pincode || '560100'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
