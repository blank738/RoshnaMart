import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Headphones, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 mt-20 border-t border-slate-800">
      {/* Feature Highlights Banner */}
      <div className="container pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Free Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">On all orders above ₹500 across India</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Verified Sellers</h4>
              <p className="text-xs text-slate-400 mt-0.5">100% Admin vetted quality merchants</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Easy 7-Day Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free pickups & instant refunds</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Headphones size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">24/7 Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">Dedicated customer & seller assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand & Mission */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-2xl text-white">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-900 shadow-sm">
              <ShoppingBag size={20} />
            </div>
            <span>ROSHNA<span className="text-emerald-400">MART</span></span>
          </Link>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            RoshnaMart is a modern multi-vendor marketplace connecting passionate independent sellers and discerning buyers. One checkout, limitless variety, transparent commissions.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Marketplace Platform</span>
            <span>•</span>
            <span>Made with precision</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Shop & Explore</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/products" className="hover:text-emerald-400 transition">All Products</Link></li>
            <li><Link to="/products?sortBy=popular" className="hover:text-emerald-400 transition">Popular Items</Link></li>
            <li><Link to="/products?sortBy=priceAsc" className="hover:text-emerald-400 transition">Special Deals</Link></li>
            <li><Link to="/about" className="hover:text-emerald-400 transition">Why RoshnaMart</Link></li>
          </ul>
        </div>

        {/* Sellers & Partners */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">For Sellers</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/register/seller" className="text-emerald-400 font-semibold hover:underline">Become a Seller</Link></li>
            <li><Link to="/seller/dashboard" className="hover:text-emerald-400 transition">Seller Dashboard</Link></li>
            <li><Link to="/about" className="hover:text-emerald-400 transition">Commission Policy</Link></li>
            <li><Link to="/login" className="hover:text-emerald-400 transition">Vendor Login</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Customer Support</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/buyer/orders" className="hover:text-emerald-400 transition">Track Your Order</Link></li>
            <li><Link to="/buyer/orders" className="hover:text-emerald-400 transition">Returns & Refunds</Link></li>
            <li><Link to="/login" className="hover:text-emerald-400 transition">Buyer Login</Link></li>
            <li><a href="mailto:support@roshnamart.com" className="hover:text-emerald-400 transition">support@roshnamart.com</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="container pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} RoshnaMart Marketplace. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span>Secure Multi-Vendor Architecture</span>
          <span>•</span>
          <span>Verified Demo Platform</span>
        </div>
      </div>
    </footer>
  );
};
