import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Store, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, isBuyer } = useAuth();
  const { showToast } = useToast();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  const effectivePrice = product.discountPrice ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const isOutOfStock = product.quantity <= 0 || product.status === 'OUT_OF_STOCK';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    setAdding(true);
    await addToCart(product.id, 1);
    setAdding(false);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please login as a buyer to use your wishlist', 'warning');
      return;
    }
    if (!isBuyer) return;

    try {
      if (isWishlisted) {
        await orderService.removeFromWishlist(product.id);
        setIsWishlisted(false);
        showToast('Removed from wishlist', 'info');
      } else {
        await orderService.addToWishlist(product.id);
        setIsWishlisted(true);
        showToast('Added to wishlist!', 'success');
      }
    } catch (err) {
      showToast('Failed to update wishlist', 'error');
    }
  };

  return (
    <div className="card card-hover flex flex-col justify-between overflow-hidden p-0 border border-slate-200 bg-white group rounded-2xl">
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
              {product.discountPercentage ? `${product.discountPercentage}% OFF` : 'SALE'}
            </span>
          )}
          {product.categoryName && (
            <span className="bg-slate-900/80 backdrop-blur text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {product.categoryName}
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition shadow-md cursor-pointer ${
            isWishlisted
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-white/90 text-slate-500 hover:text-red-500 hover:bg-white'
          }`}
          title="Save to Wishlist"
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full shadow-lg tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-2">
          {/* Seller Attribution */}
          {product.sellerBusinessName && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Store size={13} className="text-emerald-600" />
              <span className="truncate">{product.sellerBusinessName}</span>
            </div>
          )}

          {/* Title */}
          <Link to={`/products/${product.id}`} className="block">
            <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 hover:text-emerald-600 transition leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center text-amber-500">
              <Star size={14} fill="currentColor" />
              <span className="font-bold ml-1 text-slate-800">{product.rating ? product.rating.toFixed(1) : 'New'}</span>
            </div>
            {product.reviewCount > 0 && (
              <span className="text-slate-400">({product.reviewCount})</span>
            )}
          </div>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ₹{Number(effectivePrice).toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {product.quantity > 0 && product.quantity <= 5 && (
              <p className="text-[10px] text-amber-600 font-bold mt-0.5">
                Only {product.quantity} left!
              </p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`btn btn-sm ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'btn-primary shadow-sm'
            }`}
          >
            {adding ? (
              <Check size={16} className="animate-spin" />
            ) : (
              <>
                <ShoppingCart size={14} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
