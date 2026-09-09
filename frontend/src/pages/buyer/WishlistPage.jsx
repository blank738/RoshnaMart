import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, Store, Star } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const WishlistPage = () => {
  const { refreshCart } = useCart();
  const { showToast } = useToast();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await orderService.getWishlist();
      setWishlist(data || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      showToast('Failed to load wishlist items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await orderService.removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((item) => item.product?.id !== productId && item.id !== productId));
      showToast('Item removed from wishlist', 'info');
    } catch (err) {
      showToast('Failed to remove item', 'error');
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      setMovingId(productId);
      await orderService.moveToCart(productId);
      await refreshCart();
      setWishlist((prev) => prev.filter((item) => item.product?.id !== productId && item.id !== productId));
      showToast('Item moved to your cart!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to move item to cart', 'error');
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Saved Wishlist</h1>
          <p className="text-xs text-slate-500 mt-1">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
        <Link to="/products" className="btn btn-outline btn-sm text-xs">
          Browse Catalog
        </Link>
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading your wishlist...</p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <Heart size={30} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500 mt-1">
              Save items you love by clicking the heart icon on any product card!
            </p>
          </div>
          <Link to="/products" className="btn btn-primary btn-sm inline-flex items-center gap-1.5">
            <span>Discover Products</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const product = item.product || item;
            const effectivePrice = product.discountPrice || product.price;
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            const isOutOfStock = product.quantity <= 0;

            return (
              <div
                key={product.id}
                className="card p-0 rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition"
              >
                {/* Image */}
                <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                  <Link to={`/products/${product.id}`} className="block w-full h-full">
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-red-500 hover:bg-red-50 flex items-center justify-center shadow transition cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                  <div className="space-y-1.5">
                    {product.sellerBusinessName && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Store size={12} className="text-emerald-600" />
                        <span className="truncate">{product.sellerBusinessName}</span>
                      </p>
                    )}
                    <Link
                      to={`/products/${product.id}`}
                      className="font-bold text-sm text-slate-900 hover:text-emerald-600 transition line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-baseline gap-2">
                      <span className="font-black text-sm text-slate-900">
                        ₹{Number(effectivePrice).toLocaleString('en-IN')}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Move to cart action */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(product.id)}
                      disabled={isOutOfStock || movingId === product.id}
                      className={`btn btn-sm w-full font-bold text-xs flex items-center justify-center gap-1.5 ${
                        isOutOfStock
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'btn-primary'
                      }`}
                    >
                      <ShoppingCart size={14} />
                      <span>{isOutOfStock ? 'Out of Stock' : 'Move to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
