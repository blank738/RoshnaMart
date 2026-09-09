import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, 
  Tag, Store, Truck, CheckCircle2, Heart, AlertCircle 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { cartService } from '../../services/cartService';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';

export const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem, clearCart, cartLoading } = useCart();
  const { showToast } = useToast();

  const [settings, setSettings] = useState({
    deliveryCharge: 50,
    freeDeliveryThreshold: 500,
    minOrderAmount: 100,
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // Fetch dynamic marketplace settings
  useEffect(() => {
    productService.getMarketplaceSettings()
      .then((data) => {
        if (data) {
          setSettings({
            deliveryCharge: Number(data.deliveryCharge || 50),
            freeDeliveryThreshold: Number(data.freeDeliveryThreshold || 500),
            minOrderAmount: Number(data.minOrderAmount || 100),
          });
        }
      })
      .catch((err) => console.error('Failed to load settings:', err));
  }, []);

  const items = cart?.items || [];
  const subtotal = Number(cart?.subtotal || 0);

  const deliveryThreshold = settings.freeDeliveryThreshold;
  const isFreeDelivery = subtotal >= deliveryThreshold;
  const deliveryFee = (isFreeDelivery || subtotal === 0) ? 0 : settings.deliveryCharge;
  const amountToFreeDelivery = Math.max(0, deliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / deliveryThreshold) * 100));

  const discountAmount = appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);
  const meetsMinOrder = subtotal >= settings.minOrderAmount;

  // Group items by Seller (Requirement 19)
  const itemsBySeller = items.reduce((acc, item) => {
    const sellerKey = item.sellerBusinessName || 'Independent Merchant';
    if (!acc[sellerKey]) {
      acc[sellerKey] = {
        sellerName: sellerKey,
        items: [],
        sellerSubtotal: 0,
      };
    }
    acc[sellerKey].items.push(item);
    acc[sellerKey].sellerSubtotal += Number(item.subtotal || 0);
    return acc;
  }, {});

  const sellerGroups = Object.values(itemsBySeller);

  const handleUpdateQty = async (itemId, newQty, currentStock) => {
    if (newQty < 1) return;
    if (newQty > currentStock) {
      showToast(`Only ${currentStock} items in stock`, 'warning');
      return;
    }
    setUpdatingItemId(itemId);
    await updateQuantity(itemId, newQty);
    setUpdatingItemId(null);
  };

  const handleMoveToWishlist = async (item) => {
    try {
      await orderService.addToWishlist(item.productId);
      await removeItem(item.id);
      showToast(`Moved "${item.productName}" to wishlist`, 'success');
    } catch (err) {
      showToast('Failed to move item to wishlist', 'error');
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      showToast('Please enter a coupon code', 'warning');
      return;
    }

    try {
      setValidatingCoupon(true);
      const res = await cartService.validateCoupon(couponCode.trim(), subtotal);
      if (res.valid) {
        setAppliedCoupon({
          code: res.code,
          discountAmount: res.discountAmount,
          message: res.message,
        });
        showToast(res.message || 'Coupon applied successfully!', 'success');
      } else {
        showToast(res.message || 'Invalid coupon code', 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to validate coupon';
      showToast(msg, 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    showToast('Coupon removed', 'info');
  };

  const handleProceedToCheckout = () => {
    if (!meetsMinOrder) {
      showToast(`Minimum order amount is ₹${settings.minOrderAmount}`, 'warning');
      return;
    }

    navigate('/buyer/checkout', {
      state: {
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
        discountAmount: discountAmount,
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <ShoppingCart size={40} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Your shopping cart is empty</h1>
        <p className="text-sm text-slate-500 max-w-sm">
          Looks like you haven't added any items to your cart yet. Discover quality items from verified independent sellers!
        </p>
        <Link to="/products" className="btn btn-primary btn-md inline-flex items-center gap-2 mt-4 shadow-md">
          <span>Start Shopping</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} across {sellerGroups.length} independent {sellerGroups.length === 1 ? 'seller' : 'sellers'}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <Trash2 size={14} /> Clear entire cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List Grouped by Seller */}
        <div className="lg:col-span-8 space-y-6">
          {/* Free Shipping Progress Alert */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <Truck size={18} className="text-emerald-700 flex-shrink-0" />
                {isFreeDelivery ? (
                  <span>🎉 You qualified for FREE Delivery!</span>
                ) : (
                  <span>
                    Add <span className="font-extrabold">₹{amountToFreeDelivery.toFixed(0)}</span> more to qualify for <span className="font-extrabold">FREE Delivery</span> (threshold: ₹{deliveryThreshold})
                  </span>
                )}
              </div>
              <span className="font-bold text-emerald-800">{freeDeliveryProgress}%</span>
            </div>
            <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Grouped Products by Vendor */}
          {sellerGroups.map((group) => (
            <div key={group.sellerName} className="vendor-cart-group">
              {/* Vendor Header */}
              <div className="vendor-cart-header">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Store size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>Sold by {group.sellerName}</span>
                      <ShieldCheck size={14} className="text-emerald-600" title="Verified Merchant" />
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {group.items.length} {group.items.length === 1 ? 'item' : 'items'} in this shipment
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Seller Subtotal</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{group.sellerSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Vendor Items */}
              <div className="divide-y divide-slate-100">
                {group.items.map((item) => {
                  const isUpdating = updatingItemId === item.id;
                  const hasDiscount = item.productDiscountPrice && item.productDiscountPrice < item.productPrice;
                  const unitPrice = item.productDiscountPrice || item.productPrice;

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white hover:bg-slate-50/50 transition"
                    >
                      {/* Thumbnail */}
                      <Link
                        to={`/products/${item.productId}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200"
                      >
                        <img
                          src={item.productImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 space-y-1 w-full sm:w-auto">
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-bold text-sm text-slate-900 hover:text-emerald-600 transition block line-clamp-1"
                        >
                          {item.productName}
                        </Link>
                        <div className="flex items-baseline gap-2">
                          <span className="font-extrabold text-sm text-slate-900">
                            ₹{Number(unitPrice).toLocaleString('en-IN')}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{Number(item.productPrice).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {item.availableStock && item.availableStock <= 5 && (
                          <span className="text-[10px] font-bold text-amber-600">
                            Only {item.availableStock} in stock
                          </span>
                        )}
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, item.quantity - 1, item.availableStock)}
                            disabled={item.quantity <= 1 || isUpdating}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-9 text-center text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, item.quantity + 1, item.availableStock)}
                            disabled={item.quantity >= item.availableStock || isUpdating}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-right min-w-[70px]">
                          <span className="text-sm font-black text-slate-900 block">
                            ₹{Number(item.subtotal).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveToWishlist(item)}
                            className="text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="Save to Wishlist"
                          >
                            <Heart size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          <div className="card p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-5">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            {/* Coupon Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <Tag size={14} className="text-emerald-600" /> Have a Coupon Code?
              </label>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <div>
                      <span className="font-mono font-bold text-xs text-emerald-900 block">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[10px] text-emerald-700">
                        Discount of ₹{appliedCoupon.discountAmount} applied
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME100"
                    className="form-input text-xs font-mono uppercase py-2"
                  />
                  <button
                    type="submit"
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="btn btn-outline btn-sm whitespace-nowrap font-bold"
                  >
                    {validatingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal ({items.length} items)</span>
                <span className="font-bold text-slate-900">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery Logistics</span>
                {deliveryFee === 0 ? (
                  <span className="badge badge-success text-[10px] font-bold">FREE</span>
                ) : (
                  <span className="font-bold text-slate-900">₹{deliveryFee}</span>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-slate-900 block">Estimated Total</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Includes all marketplace taxes</span>
                </div>
                <span className="text-2xl font-black text-slate-900">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {!meetsMinOrder && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>Minimum order spend is ₹{settings.minOrderAmount}. Please add more items to checkout.</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={cartLoading || !meetsMinOrder}
              className="btn btn-primary w-full py-3 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            {/* Trust Badges */}
            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-600" /> Verified Checkout
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck size={14} className="text-emerald-600" /> Fast Delivery
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
