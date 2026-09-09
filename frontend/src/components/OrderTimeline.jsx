import React from 'react';
import { CheckCircle2, Clock, Truck, Package, ShieldCheck, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', icon: ShieldCheck },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

export const OrderTimeline = ({ currentStatus }) => {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <XCircle size={24} className="text-red-600 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-sm">This order was cancelled</h4>
          <p className="text-xs text-red-600 mt-0.5">The order items were returned to inventory and payment has been processed for refund.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="py-6 px-2">
      <div className="relative flex items-center justify-between">
        {/* Connecting Progress Line */}
        <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-4 ring-emerald-50'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                } ${isCurrent ? 'scale-110 ring-4 ring-emerald-200' : ''}`}
              >
                <Icon size={18} />
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 text-center max-w-[80px] leading-tight ${
                  isDone ? 'text-slate-900 font-bold' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
