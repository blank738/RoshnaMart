import {
  Clock,
  ShieldCheck,
  Package,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export const ORDER_TIMELINE_STEPS = [
  {
    key: 'PLACED',
    label: 'Order Placed',
    description: 'Order received & logged in system',
    icon: Clock,
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmed',
    description: 'Order confirmed & inventory reserved',
    icon: ShieldCheck,
  },
  {
    key: 'PROCESSING',
    label: 'Processing',
    description: 'Merchant is preparing and packing items',
    icon: Package,
  },
  {
    key: 'SHIPPED',
    label: 'Shipped',
    description: 'Dispatched and handed over to courier',
    icon: Truck,
  },
  {
    key: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    description: 'With local courier for delivery today',
    icon: Truck,
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    description: 'Successfully delivered to customer',
    icon: CheckCircle2,
  },
];

const KNOWN_STATUS_MAP = {
  PLACED: 'PLACED',
  ORDER_PLACED: 'PLACED',
  PENDING: 'PLACED',
  NEW: 'PLACED',

  CONFIRMED: 'CONFIRMED',
  ORDER_CONFIRMED: 'CONFIRMED',

  PROCESSING: 'PROCESSING',
  IN_PROGRESS: 'PROCESSING',
  PACKED: 'PROCESSING',
  PREPARING: 'PROCESSING',

  SHIPPED: 'SHIPPED',
  DISPATCHED: 'SHIPPED',
  IN_TRANSIT: 'SHIPPED',

  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  'OUT-FOR-DELIVERY': 'OUT_FOR_DELIVERY',
  OUTFORDELIVERY: 'OUT_FOR_DELIVERY',

  DELIVERED: 'DELIVERED',
  COMPLETED: 'DELIVERED',

  CANCELLED: 'CANCELLED',
  CANCELED: 'CANCELLED',

  RETURN_REQUESTED: 'RETURN_REQUESTED',
  RETURNED: 'RETURNED',
  REFUNDED: 'REFUNDED',
};

/**
 * Normalizes raw status from any source (string, object, backend enum).
 * Returns canonical status string or null if invalid/missing.
 * Does NOT silently fallback to PLACED when invalid!
 */
export function normalizeOrderStatus(raw) {
  if (!raw) return null;

  let str = '';
  if (typeof raw === 'string') {
    str = raw;
  } else if (typeof raw === 'object') {
    str = raw.orderStatus || raw.status || raw.itemStatus || '';
  }

  const cleaned = String(str).trim().toUpperCase();
  if (!cleaned) return null;

  const normalized = KNOWN_STATUS_MAP[cleaned];
  if (!normalized) {
    console.warn(`[OrderStatus] Unrecognized status: "${str}"`);
    return null;
  }

  return normalized;
}

/**
 * Derives aggregate order status from child order items.
 */
export function deriveStatusFromItems(items) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const allCancelled = items.every((i) => {
    const s = normalizeOrderStatus(i.itemStatus || i.status);
    return s === 'CANCELLED';
  });
  if (allCancelled) return 'CANCELLED';

  const active = items.filter((i) => {
    const s = normalizeOrderStatus(i.itemStatus || i.status);
    return s !== 'CANCELLED';
  });
  if (active.length === 0) return 'CANCELLED';

  const terminalStatuses = ['DELIVERED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'];

  const allDelivered = active.every((i) => {
    const s = normalizeOrderStatus(i.itemStatus || i.status);
    return terminalStatuses.includes(s);
  });
  if (allDelivered) return 'DELIVERED';

  const allOutForDelivery = active.every((i) => {
    const s = normalizeOrderStatus(i.itemStatus || i.status);
    return s === 'OUT_FOR_DELIVERY' || terminalStatuses.includes(s);
  });
  if (allOutForDelivery) return 'OUT_FOR_DELIVERY';

  const allShipped = active.every((i) => {
    const s = normalizeOrderStatus(i.itemStatus || i.status);
    return s === 'SHIPPED' || s === 'OUT_FOR_DELIVERY' || terminalStatuses.includes(s);
  });
  if (allShipped) return 'SHIPPED';

  const anyProcessing = active.some((i) => {
    const s = normalizeOrderStatus(i.itemStatus || i.status);
    return s === 'PROCESSING' || s === 'SHIPPED' || s === 'OUT_FOR_DELIVERY' || terminalStatuses.includes(s);
  });
  if (anyProcessing) return 'PROCESSING';

  const anyConfirmed = active.some((i) => {
    const s = normalizeOrderStatus(i.itemStatus || i.status);
    return s === 'CONFIRMED';
  });
  if (anyConfirmed) return 'CONFIRMED';

  return 'PLACED';
}

/**
 * Formats status for UI display.
 */
export function formatOrderStatus(status) {
  const norm = normalizeOrderStatus(status);
  if (!norm) return 'Status Unavailable';

  const step = ORDER_TIMELINE_STEPS.find((s) => s.key === norm);
  if (step) return step.label;

  switch (norm) {
    case 'CANCELLED':
      return 'Cancelled';
    case 'RETURN_REQUESTED':
      return 'Return Requested';
    case 'RETURNED':
      return 'Returned';
    case 'REFUNDED':
      return 'Refunded';
    default:
      return norm.replace(/_/g, ' ');
  }
}

/**
 * Returns badge class for a given status.
 */
export function getStatusBadgeClass(status) {
  const norm = normalizeOrderStatus(status);
  switch (norm) {
    case 'DELIVERED':
      return 'badge-success';
    case 'CANCELLED':
      return 'badge-danger';
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY':
      return 'badge-warning';
    case 'RETURN_REQUESTED':
    case 'RETURNED':
    case 'REFUNDED':
      return 'badge-neutral';
    default:
      return 'badge-info';
  }
}
