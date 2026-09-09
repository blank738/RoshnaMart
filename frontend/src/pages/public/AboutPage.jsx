import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Zap, HeartHandshake, CheckCircle2, Store } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="container py-12 space-y-16 max-w-4xl">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
          <ShoppingBag size={32} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          About RoshnaMart
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The next-generation multi-vendor e-commerce marketplace empowering independent brands and delighted buyers across India.
        </p>
      </div>

      <div className="card p-8 rounded-3xl border border-slate-200 bg-white space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Our Core Architecture</h2>
        <p className="text-slate-600 leading-relaxed text-sm">
          Unlike traditional monolithic stores where one merchant sells products, RoshnaMart operates as a true decentralized multi-vendor marketplace.
          Buyers enjoy the convenience of browsing diverse vendors—from boutique electronics creators to high-end apparel labels—and ordering everything together in a single transactional checkout.
        </p>
        <p className="text-slate-600 leading-relaxed text-sm">
          Behind the scenes, our enterprise Spring Boot transactional engine computes seller-specific order items, calculates transparent 5% platform commissions, manages stock reservations atomically, and provides independent fulfillment dashboards for every merchant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 rounded-2xl border border-slate-200 text-center space-y-3">
          <ShieldCheck size={28} className="text-emerald-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">Verified Merchants</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every vendor profile is vetted and approved by our administrator team before publishing products.
          </p>
        </div>

        <div className="card p-6 rounded-2xl border border-slate-200 text-center space-y-3">
          <Zap size={28} className="text-emerald-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">Atomic Stock Sync</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Real inventory controls prevent overselling and ensure items are held only during confirmed checkout.
          </p>
        </div>

        <div className="card p-6 rounded-2xl border border-slate-200 text-center space-y-3">
          <HeartHandshake size={28} className="text-emerald-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">Fair 5% Commission</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Transparent marketplace commissions ensure maximum earnings for merchants and honest value for customers.
          </p>
        </div>
      </div>

      <div className="bg-emerald-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-3xl font-extrabold">Join the RoshnaMart Network</h2>
        <p className="text-emerald-200 text-sm max-w-xl mx-auto">
          Start shopping from curated Indian merchants today or launch your online storefront to reach thousands of buyers.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/products" className="btn btn-primary bg-white text-emerald-950 hover:bg-emerald-50 font-bold border-none">
            Browse Products
          </Link>
          <Link to="/register/seller" className="btn btn-outline border-emerald-400 text-white hover:bg-emerald-800 font-bold">
            <Store size={16} />
            <span>Become a Vendor</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
