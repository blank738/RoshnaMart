import React from 'react';
import {
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  ORDER_TIMELINE_STEPS,
  normalizeOrderStatus,
  deriveStatusFromItems,
  formatOrderStatus,
} from '../utils/orderStatus';

export const OrderTimeline = ({ currentStatus, deliveryDate, items }) => {
  // Resolve canonical status: try currentStatus, or fallback to derived status from items
  const resolved =
    normalizeOrderStatus(currentStatus) ||
    (items ? deriveStatusFromItems(items) : null);

  // 1. Error / Unavailable State (NEVER silently show Order Placed)
  if (!resolved) {
    return (
      <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200">
        <AlertTriangle size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider">
            Tracking Status Unavailable
          </h4>
          <p className="text-xs text-amber-700 mt-1">
            We are currently unable to retrieve the latest fulfillment status for this order.
            Please use the refresh button above or contact customer support if this persists.
          </p>
        </div>
      </div>
    );
  }

  // 2. Cancelled State
  if (resolved === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200">
        <XCircle size={26} className="text-red-600 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-sm">This Order Was Cancelled</h4>
          <p className="text-xs text-red-600 mt-0.5">
            This order has been cancelled. If any payment was captured, refund and inventory
            restoration will be handled according to our policy.
          </p>
        </div>
      </div>
    );
  }

  // 3. Return / Refund States
  const isReturnOrRefund = ['RETURN_REQUESTED', 'RETURNED', 'REFUNDED'].includes(resolved);

  // 4. Lifecycle steps
  const isDelivered = resolved === 'DELIVERED' || isReturnOrRefund;
  const currentIndex = isDelivered
    ? ORDER_TIMELINE_STEPS.length - 1
    : ORDER_TIMELINE_STEPS.findIndex((step) => step.key === resolved);

  const activeIndex = currentIndex >= 0 ? currentIndex : 0;
  const progressPercent = (activeIndex / (ORDER_TIMELINE_STEPS.length - 1)) * 100;

  // Format delivery timestamp if available
  const formattedDeliveryDate = deliveryDate
    ? new Date(deliveryDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="space-y-5">
      {/* Return/Refund info banner if applicable */}
      {isReturnOrRefund && (
        <div className="flex items-center gap-2.5 p-3.5 bg-blue-50 text-blue-800 rounded-xl border border-blue-200 text-xs">
          <RotateCcw size={16} className="text-blue-600 flex-shrink-0" />
          <span>
            <strong>Return Status:</strong> {formatOrderStatus(resolved)}. Delivered package is in return/refund processing.
          </span>
        </div>
      )}

      {/* Delivered celebration banner */}
      {isDelivered && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50 text-emerald-950 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-600/30">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm flex items-center gap-1.5 text-emerald-900">
                <span>Order Delivered Successfully</span>
                <Sparkles size={14} className="text-emerald-600" />
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                All multi-vendor packages have been fulfilled and delivered to your shipping address.
              </p>
            </div>
          </div>

          {formattedDeliveryDate && (
            <div className="text-left sm:text-right text-xs bg-white/80 py-1.5 px-3 rounded-lg border border-emerald-200 self-start sm:self-auto">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Delivered On</span>
              <span className="font-extrabold text-emerald-950 font-mono">{formattedDeliveryDate}</span>
            </div>
          )}
        </div>
      )}

      {/* Visual Fulfillment Steps */}
      <div className="py-4 px-2 overflow-x-auto">
        <div className="relative min-w-[680px]">
          {/* Connecting Progress Track */}
          <div className="absolute top-5 left-8 right-8 h-1.5 bg-slate-200 rounded-full z-0">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex items-center justify-between z-10">
            {ORDER_TIMELINE_STEPS.map((step, idx) => {
              // When delivered, every single step is fully completed with checkmark!
              const isCompleted = isDelivered ? true : idx < activeIndex;
              const isCurrent = isDelivered ? idx === ORDER_TIMELINE_STEPS.length - 1 : idx === activeIndex;
              const isPending = !isCompleted && !isCurrent;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center max-w-[100px] text-center">
                  {/* Step Circle Indicator */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 font-bold ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-100'
                        : isCurrent
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-4 ring-emerald-200 scale-110 animate-pulse'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                    title={`${step.label}: ${step.description}`}
                  >
                    {isCompleted ? (
                      <Check size={20} strokeWidth={3} className="text-white" />
                    ) : (
                      <Icon size={18} />
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`text-xs mt-2.5 leading-tight ${
                      isCurrent
                        ? 'text-emerald-950 font-black'
                        : isCompleted
                        ? 'text-slate-900 font-bold'
                        : 'text-slate-400 font-medium'
                    }`}
                  >
                    {step.label}
                  </span>

                  {/* Status Indicator Tag for Current */}
                  {isCurrent && (
                    <span className="inline-block mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      {isDelivered ? 'Final' : 'Active'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};