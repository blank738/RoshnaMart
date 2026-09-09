import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, ShoppingCart, Heart, Store, ShieldCheck, Truck, RefreshCw, 
  Check, Plus, Minus, ArrowLeft, MessageSquare, AlertTriangle 
} from 'lucide-react';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, isBuyer } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isEligibleToReview, setIsEligibleToReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const [prodData, revData] = await Promise.all([
          productService.getProductById(id),
          productService.getProductReviews(id),
        ]);
        setProduct(prodData);
        setReviews(revData || []);
        setActiveImage(prodData.imageUrl);

        if (isAuthenticated && isBuyer) {
          orderService.checkReviewEligibility(id)
            .then((res) => setIsEligibleToReview(res.eligible || false))
            .catch(() => {});
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        showToast('Product not found', 'error');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, isAuthenticated, isBuyer, navigate, showToast]);

  if (loading || !product) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const effectivePrice = product.discountPrice ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const isOutOfStock = product.quantity <= 0 || product.status === 'OUT_OF_STOCK';

  const handleQuantityChange = (delta) => {
    const next = quantity + delta;
    if (next >= 1 && next <= product.quantity) {
      setQuantity(next);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    await addToCart(product.id, quantity);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    const added = await addToCart(product.id, quantity);
    if (added) {
      navigate('/buyer/checkout');
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated || !isBuyer) {
      showToast('Please login as a buyer to save items to wishlist', 'warning');
      return;
    }
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      showToast('Please complete all review fields', 'warning');
      return;
    }

    try {
      setSubmittingReview(true);
      await orderService.addReview({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });

      showToast('Review submitted successfully! Thank you.', 'success');
      setReviewModalOpen(false);
      setIsEligibleToReview(false);

      // Refresh reviews & product data
      const [prodData, revData] = await Promise.all([
        productService.getProductById(id),
        productService.getProductReviews(id),
      ]);
      setProduct(prodData);
      setReviews(revData || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review';
      showToast(msg, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const allImages = [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean);

  return (
    <div className="container py-8 space-y-12">
      {/* Back Button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft size={16} />
        <span>Back to Products</span>
      </Link>

      {/* Main Product Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md relative">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                {product.discountPercentage ? `${product.discountPercentage}% OFF` : 'DEAL'}
              </span>
            )}
          </div>

          {/* Additional Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                    activeImage === img ? 'border-emerald-600 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Details & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            {/* Category and SKU */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>{product.categoryName}</span>
              <span>•</span>
              <span>SKU: {product.sku}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center text-amber-500 gap-1 text-sm font-bold">
                <Star size={18} fill="currentColor" />
                <span>{product.rating ? product.rating.toFixed(1) : 'New'}</span>
              </div>
              <span className="text-slate-300">•</span>
              <a href="#reviews" className="text-xs font-semibold text-emerald-600 hover:underline">
                {reviews.length} {reviews.length === 1 ? 'Customer Review' : 'Customer Reviews'}
              </a>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              ₹{Number(effectivePrice).toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-base text-slate-400 line-through">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
            )}
            {hasDiscount && (
              <span className="badge badge-success text-xs font-bold">
                Save ₹{Number(product.price - product.discountPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Availability:</span>
            {isOutOfStock ? (
              <p className="text-sm font-bold text-red-600 flex items-center gap-1.5">
                <AlertTriangle size={16} /> Currently Out of Stock
              </p>
            ) : (
              <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                <Check size={16} className="text-emerald-600" /> In Stock ({product.quantity} available)
              </p>
            )}
          </div>

          {/* Verified Seller Box */}
          <div className="card p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Store size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Sold & Shipped by</p>
                <h4 className="text-sm font-bold text-slate-900">{product.sellerBusinessName || 'Verified Seller'}</h4>
              </div>
            </div>
            <span className="badge badge-success text-[10px] flex items-center gap-1">
              <ShieldCheck size={12} /> Verified
            </span>
          </div>

          {/* Quantity Selector & Purchase Actions */}
          <div className="space-y-4 pt-2">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Quantity:</span>
                <div className="inline-flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold text-sm text-slate-900">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.quantity}
                    className="p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn btn-primary btn-lg rounded-xl flex-1 font-bold shadow-md shadow-emerald-600/20"
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="btn btn-secondary btn-lg rounded-xl flex-1 font-bold"
              >
                <span>Buy Now</span>
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-xl border transition shadow-sm cursor-pointer ${
                  isWishlisted
                    ? 'bg-red-50 text-red-500 border-red-200'
                    : 'bg-white text-slate-500 border-slate-300 hover:text-red-500'
                }`}
                title="Wishlist"
              >
                <Heart size={22} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-emerald-600" />
              <span>Free Delivery on orders above ₹500</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw size={18} className="text-emerald-600" />
              <span>7-Day Return Policy guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <section className="card p-8 rounded-3xl border border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Product Description</h3>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {product.description || 'No detailed description provided for this product.'}
        </p>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="card p-8 rounded-3xl border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare size={20} className="text-emerald-600" />
              <span>Customer Reviews & Ratings</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Authentic reviews submitted by buyers who purchased this item
            </p>
          </div>

          {isEligibleToReview && (
            <button
              onClick={() => setReviewModalOpen(true)}
              className="btn btn-outline-primary btn-sm rounded-xl font-bold"
            >
              Write a Review
            </button>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <Star size={36} className="mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No reviews yet for this product.</p>
            <p className="text-xs text-slate-400">Be the first verified purchaser to leave feedback!</p>
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{rev.buyerName || 'Verified Buyer'}</span>
                    <span className="badge badge-success text-[10px]">Verified Purchase</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <div className="flex items-center text-amber-500 gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < rev.rating ? 'currentColor' : 'none'}
                      className={i < rev.rating ? 'text-amber-500' : 'text-slate-200'}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-800 ml-1.5">{rev.title}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Review Submission Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Write a Customer Review"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Your Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1 text-amber-500 cursor-pointer"
                >
                  <Star size={28} fill={star <= reviewRating ? 'currentColor' : 'none'} />
                </button>
              ))}
              <span className="text-sm font-bold text-slate-700 ml-2">{reviewRating} out of 5 Stars</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Review Headline</label>
            <input
              type="text"
              required
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="e.g. Excellent sound quality and battery life!"
              className="form-input text-sm"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Feedback</label>
            <textarea
              required
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share what you liked or disliked about this product..."
              className="form-textarea text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className="btn btn-primary btn-sm font-bold"
            >
              {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
