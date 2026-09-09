import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, MapPin, ShoppingBag } from 'lucide-react';
import { orderService } from '../../services/orderService';

export const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && id) {
      orderService.getBuyerOrderById(id)
        .then((data) => setOrder(data))
        .catch((err) => console.error('Failed to load order:', err))
        .finally(() => setLoading(false));
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-slate-500">Retrieving order confirmation...</p>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-2xl space-y-8">
      {/* Celebration Header */}
      <div className="card p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-xl">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 size={44} />
        </div>
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Thank You For Your Order!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your multi-vendor order has been placed and transmitted to the independent merchants for fulfillment.
          </p>
        </div>

        {order && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-3">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200">
              <span className="text-slate-500">Order Reference</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber}</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-bold text-slate-900 uppercase">{order.paymentMethod}</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200">
              <span className="text-slate-500">Total Paid</span>
              <span className="font-black text-emerald-700 text-base">
                ₹{Number(order.finalAmount).toLocaleString('en-IN')}
              </span>
            </div>

            {order.shippingAddress && (
              <div className="text-xs space-y-0.5">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <MapPin size={12} /> Shipping to:
                </span>
                <p className="font-bold text-slate-800">{order.shippingAddress.streetAddress}</p>
                <p className="text-slate-500">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to={`/buyer/orders/${id}`}
            className="btn btn-primary w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <Package size={16} />
            <span>Track Order Timeline</span>
          </Link>
          <Link
            to="/products"
            className="btn btn-outline w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
