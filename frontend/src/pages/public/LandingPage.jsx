import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Truck, RefreshCw, 
  Store, Star, Search, CheckCircle2, Award, Zap
} from 'lucide-react';
import { productService } from '../../services/productService';
import { ProductCard } from '../../components/ProductCard';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [heroSearch, setHeroSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cats, featured, discounted] = await Promise.all([
          productService.getCategories(),
          productService.getFeaturedProducts(),
          productService.getDiscountedProducts(),
        ]);
        setCategories(cats || []);
        setFeaturedProducts(featured || []);
        setDiscountedProducts(discounted || []);
      } catch (err) {
        console.error('Failed to load landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden hero-gradient pt-12 pb-20 border-b border-slate-200">
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/60 text-emerald-900 text-xs font-bold tracking-wide uppercase">
                <Sparkles size={14} className="text-emerald-600" />
                <span>India's Trusted Multi-Vendor E-Commerce Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Shop Smarter. <br />
                Shop Better. <br />
                <span className="text-emerald-600">Shop RoshnaMart.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Experience the next generation of online shopping. Browse curated goods from hundreds of verified independent merchants with one single unified checkout.
              </p>

              {/* Hero Search Bar */}
              <form onSubmit={handleHeroSearch} className="max-w-lg relative flex items-center shadow-lg rounded-2xl bg-white p-1.5 border border-slate-200">
                <Search size={20} className="ml-3 text-slate-400" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="What are you shopping for today?"
                  className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm rounded-xl px-5 py-2.5 font-bold"
                >
                  Explore
                </button>
              </form>

              {/* CTA Buttons & Stats */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link to="/products" className="btn btn-primary btn-lg rounded-xl font-bold shadow-md">
                  <span>Browse Products</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/register/seller" className="btn btn-outline btn-lg rounded-xl font-bold bg-white">
                  <Store size={18} className="text-emerald-600" />
                  <span>Become a Seller</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex items-center gap-6 text-xs text-slate-600 font-semibold border-t border-slate-200/60 max-w-lg">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Admin Verified Sellers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Multi-Vendor Checkout</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>7-Day Returns</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"
                    alt="RoshnaMart Marketplace"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Metric Badge 1 */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3 float-badge">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    <Zap size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Single Checkout</p>
                    <p className="text-sm font-bold text-slate-900">Multi-Seller Cart</p>
                  </div>
                </div>

                {/* Floating Metric Badge 2 */}
                <div className="absolute -top-6 -right-6 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3 float-badge">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                    <Star size={24} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Verified Customer</p>
                    <p className="text-sm font-bold text-slate-900">4.9 / 5.0 Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <span>Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Explore by Category</h2>
          </div>
          <Link to="/products" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?categoryId=${cat.id}`}
              className="group card card-hover p-4 text-center flex flex-col items-center gap-3 bg-white border border-slate-200 rounded-2xl category-card"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-slate-100 shadow-inner ring-4 ring-emerald-50 group-hover:ring-emerald-200 group-hover:scale-105 transition duration-300">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <Award size={14} />
              <span>Handpicked</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Products</h2>
          </div>
          <Link to="/products" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>Explore Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-0 h-80 skeleton rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* SPECIAL OFFERS / DISCOUNT DEALS */}
      {discountedProducts.length > 0 && (
        <section className="container">
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Limited Time
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
                    Super Saver Deals & Discounts
                  </h2>
                  <p className="text-emerald-200 text-sm mt-1 max-w-lg">
                    Discover handpicked bestsellers at discounted vendor pricing. Grab yours before stock runs out!
                  </p>
                </div>
                <Link to="/products?sortBy=priceAsc" className="btn btn-primary bg-white text-emerald-900 hover:bg-emerald-50 font-bold border-none shadow-md">
                  View All Deals
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                {discountedProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* WHY ROSHNAMART SECTION */}
      <section className="container pt-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Platform Advantages</span>
          <h2 className="text-3xl font-extrabold text-slate-900">Why Shop & Sell on RoshnaMart?</h2>
          <p className="text-slate-500 text-sm">
            Built from the ground up to empower both buyers and sellers with transparency, security, and seamless fulfillment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-8 text-center space-y-4 rounded-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Zap size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">One Unified Checkout</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Add products from Electronics, Fashion, and Home Decor vendors into a single cart. Pay once, and our backend automatically distributes items, tracking, and payments to each seller.
            </p>
          </div>

          <div className="card p-8 text-center space-y-4 rounded-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">100% Verified Sellers</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every seller must submit their business credentials and undergo strict admin verification before their store goes live. Zero counterfeit risk.
            </p>
          </div>

          <div className="card p-8 text-center space-y-4 rounded-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <RefreshCw size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Transparent Earnings</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sellers enjoy fair 5% marketplace commission, real-time sales reporting, instant stock management, and reliable item-level order tracking.
            </p>
          </div>
        </div>
      </section>

      {/* SELLER INVITATION BANNER */}
      <section className="container">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Grow Your Business</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Ready to sell to thousands of customers?</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Join RoshnaMart as a merchant today. Register in minutes, get approved by admin, list your products, and manage orders with our intuitive seller dashboard.
            </p>
          </div>
          <Link to="/register/seller" className="btn btn-primary btn-lg rounded-xl whitespace-nowrap font-bold shadow-lg shadow-emerald-600/30">
            <span>Register as a Seller</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};
