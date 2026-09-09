import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Package, MapPin, CreditCard, RotateCcw, XCircle, 
  Store, Star, AlertTriangle, CheckCircle2, FileText, Clock 
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { OrderTimeline } from '../../components/OrderTimeline';
import { Modal } from '../../components/Modal';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cancel order modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Return request modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState('');
  const [returnReason, setReturnReason] = useState('DEFECTIVE');
  const [returnComments, setReturnComments] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProductId, setReviewProductId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getBuyerOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order:', err);
      showToast('Order not found', 'error');
      navigate('/buyer/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const updated = await orderService.cancelOrder(id);
      setOrder(updated);
      setCancelModalOpen(false);
      showToast('Order cancelled successfully', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderItemId) {
      showToast('Please select the item you want to return', 'warning');
      return;
    }

    try {
      setSubmittingReturn(true);
      await orderService.requestReturn({
        orderId: Number(id),
        orderItemId: Number(selectedOrderItemId),
        reason: returnReason,
        comments: returnComments,
      });
      showToast('Return request submitted! Our team will review it.', 'success');
      setReturnModalOpen(false);
      fetchOrder();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit return request', 'error');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      showToast('Please provide both review title and comments', 'warning');
      return;
    }

    try {
      setSubmittingReview(true);
      await orderService.addReview({
        productId: reviewProductId,
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });
      showToast('Review posted successfully! Thank you!', 'success');
      setReviewModalOpen(false);
      setReviewTitle('');
      setReviewComment('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBuyAgain = async () => {
    try {
      await orderService.buyAgain(id);
      await refreshCart();
      showToast('Items added to cart!', 'success');
      navigate('/buyer/cart');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not re-order items', 'error');
    }
  };

  const canCancel = order && (order.orderStatus === 'PLACED' || order.orderStatus === 'CONFIRMED');
  const canReturn = order && order.orderStatus === 'DELIVERED';

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Loading order details...</p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container py-8 space-y-6 max-w-5xl">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/buyer/orders"
          className="text-xs font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Back to All Orders
        </Link>
        <div className="flex items-center gap-2">
          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="btn btn-outline btn-sm text-xs text-red-600 border-red-300 hover:bg-red-50 font-bold"
            >
              Cancel Order
            </button>
          )}
          {canReturn && (
            <button
              type="button"
              onClick={() => {
                setSelectedOrderItemId(order.items?.[0]?.id || '');
                setReturnModalOpen(true);
              }}
              className="btn btn-outline btn-sm text-xs text-amber-700 border-amber-300 hover:bg-amber-50 font-bold"
            >
              Request Return
            </button>
          )}
          <button
            type="button"
            onClick={handleBuyAgain}
            className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1"
          >
            <RotateCcw size={14} /> Buy Again
          </button>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="card rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm">
        {/* Header with Reference & Dates */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {order.orderNumber}
              </h1>
              <span className="badge badge-info text-xs font-bold uppercase">
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Placed on{' '}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent'}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Total Amount</span>
            <span className="text-2xl font-black text-slate-900">
              ₹{Number(order.finalAmount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Visual Fulfillment Timeline */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Order Fulfillment Progress
          </h3>
          <OrderTimeline currentStatus={order.orderStatus} />
        </div>

        {/* Multi-Vendor Order Items */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Package size={16} className="text-emerald-600" />
            <span>Order Items ({order.items?.length || 0})</span>
          </h3>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/50 transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.productImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120'}
                    alt={item.productName}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-bold text-sm text-slate-900 hover:text-emerald-600 transition block"
                    >
                      {item.productName}
                    </Link>
                    {item.sellerBusinessName && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Store size={12} className="text-emerald-600" />
                        <span>Vendor: {item.sellerBusinessName}</span>
                      </p>
                    )}
                    <p className="text-xs text-slate-600">
                      Quantity: <span className="font-bold">{item.quantity}</span> • Unit Price: ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{Number(item.subtotal).toLocaleString('en-IN')}
                  </span>
                  <span className="badge badge-info text-[10px] uppercase font-bold">
                    {item.itemStatus || order.orderStatus}
                  </span>

                  {order.orderStatus === 'DELIVERED' && (
                    <button
                      type="button"
                      onClick={() => {
                        setReviewProductId(item.productId);
                        setReviewModalOpen(true);
                      }}
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <Star size={12} fill="currentColor" /> Write Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          {/* Shipping Address */}
          <div className="card p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} className="text-emerald-600" /> Delivery Address
            </h4>
            {order.shippingAddress ? (
              <div className="text-xs space-y-1 text-slate-700 pt-1">
                <span className="badge badge-info text-[10px] mb-1 uppercase font-bold">
                  {order.shippingAddress.addressType || 'HOME'}
                </span>
                <p className="font-bold text-slate-900">{order.shippingAddress.streetAddress}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Address information unavailable</p>
            )}
          </div>

          {/* Payment & Charges Breakdown */}
          <div className="card p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard size={14} className="text-emerald-600" /> Payment & Cost Breakdown
            </h4>
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Payment Method</span>
                <span className="font-bold text-slate-900 uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount Applied</span>
                  <span>-₹{Number(order.discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span>
                  {Number(order.deliveryCharge) === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-[10px]">FREE</span>
                  ) : (
                    `₹${Number(order.deliveryCharge).toFixed(0)}`
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Grand Total</span>
                <span className="font-black text-base text-emerald-800">
                  ₹{Number(order.finalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Confirm Order Cancellation"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to cancel order <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>?
          </p>
          <p>
            The items will be immediately returned to the vendor stock inventory and any payments processed will be released for refund.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="btn btn-outline btn-sm text-xs"
            >
              Keep Order
            </button>
            <button
              type="button"
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="btn btn-danger btn-sm text-xs font-bold"
            >
              {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Return Request Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Submit Return Request"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label text-xs">Select Product to Return *</label>
            <select
              value={selectedOrderItemId}
              onChange={(e) => setSelectedOrderItemId(e.target.value)}
              required
              className="form-input text-xs"
            >
              {order.items?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.productName} (Qty: {item.quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Reason for Return *</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="form-input text-xs"
            >
              <option value="DEFECTIVE">Product is defective / damaged</option>
              <option value="WRONG_ITEM">Received wrong item</option>
              <option value="NOT_AS_DESCRIBED">Item not as described</option>
              <option value="SIZE_FIT_ISSUE">Size or fit issue</option>
              <option value="OTHER">Other reason</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Detailed Comments *</label>
            <textarea
              rows={3}
              required
              value={returnComments}
              onChange={(e) => setReturnComments(e.target.value)}
              placeholder="Please elaborate on the defect or reason for return..."
              className="form-input text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReturnModalOpen(false)}
              className="btn btn-outline btn-sm text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReturn}
              className="btn btn-primary btn-sm text-xs font-bold"
            >
              {submittingReturn ? 'Submitting...' : 'Submit Return'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Write Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Write a Verified Buyer Review"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label text-xs">Your Rating *</label>
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewRating(s)}
                  className="text-amber-400 hover:scale-110 transition cursor-pointer p-1"
                >
                  <Star
                    size={24}
                    fill={s <= reviewRating ? 'currentColor' : 'none'}
                    stroke="currentColor"
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">
                {reviewRating} out of 5 Stars
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Review Headline *</label>
            <input
              type="text"
              required
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="e.g. Excellent build quality and fast shipping!"
              className="form-input text-xs"
            />
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Your Detailed Feedback *</label>
            <textarea
              rows={4}
              required
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share how this product performed for you..."
              className="form-input text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="btn btn-outline btn-sm text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className="btn btn-primary btn-sm text-xs font-bold"
            >
              {submittingReview ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
