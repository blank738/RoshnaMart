import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ShieldCheck, MapPin, Plus, CheckCircle2, CreditCard, Banknote, 
  ArrowLeft, ArrowRight, Loader2, QrCode, Lock, AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import { cartService } from '../../services/cartService';
import { productService } from '../../services/productService';
import { Modal } from '../../components/Modal';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, refreshCart } = useCart();
  const { showToast } = useToast();

  const [settings, setSettings] = useState({
    deliveryCharge: 50,
    freeDeliveryThreshold: 500,
    codEnabled: true,
    onlinePaymentEnabled: true,
  });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponCode] = useState(location.state?.appliedCoupon || '');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);

  // New address modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'HOME',
    isDefault: true,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Demo Online Payment Modal state (Requirement 44)
  const [demoPaymentModalOpen, setDemoPaymentModalOpen] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [demoPaymentType, setDemoPaymentType] = useState('CARD'); // 'CARD' | 'UPI'

  const items = cart?.items || [];
  const subtotal = Number(cart?.subtotal || 0);

  // Fetch settings from backend
  useEffect(() => {
    productService.getMarketplaceSettings()
      .then((data) => {
        if (data) {
          setSettings({
            deliveryCharge: Number(data.deliveryCharge || 50),
            freeDeliveryThreshold: Number(data.freeDeliveryThreshold || 500),
            codEnabled: data.codEnabled !== false,
            onlinePaymentEnabled: data.onlinePaymentEnabled !== false,
          });
        }
      })
      .catch((err) => console.error('Failed to load checkout settings:', err));
  }, []);

  // Fetch buyer addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setAddressLoading(true);
        const data = await orderService.getAddresses();
        setAddresses(data || []);
        if (data && data.length > 0) {
          const defaultAddr = data.find((a) => a.isDefault) || data[0];
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        setAddressLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  // Validate coupon if passed from cart page
  useEffect(() => {
    if (couponCode && subtotal > 0) {
      cartService.validateCoupon(couponCode, subtotal)
        .then((res) => {
          if (res.valid) {
            setAppliedCoupon({
              code: res.code,
              discountAmount: res.discountAmount,
            });
          }
        })
        .catch(() => {});
    }
  }, [couponCode, subtotal]);

  const deliveryThreshold = settings.freeDeliveryThreshold;
  const isFreeDelivery = subtotal >= deliveryThreshold;
  const deliveryFee = (isFreeDelivery || subtotal === 0) ? 0 : settings.deliveryCharge;
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      setSavingAddress(true);
      const created = await orderService.addAddress(newAddress);
      setAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created.id);
      setIsAddressModalOpen(false);
      setNewAddress({
        streetAddress: '',
        city: '',
        state: '',
        pincode: '',
        addressType: 'HOME',
        isDefault: false,
      });
      showToast('Address added successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save address', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleCheckoutClick = () => {
    if (!selectedAddressId) {
      showToast('Please select or add a shipping address', 'warning');
      return;
    }

    if (paymentMethod === 'ONLINE') {
      setDemoPaymentModalOpen(true);
    } else {
      executeOrderPlacement('COD');
    }
  };

  const executeOrderPlacement = async (chosenPaymentMethod) => {
    try {
      setLoading(true);
      const res = await orderService.checkout({
        addressId: selectedAddressId,
        paymentMethod: chosenPaymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      });

      // Confetti Celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Confetti gracefully ignored if unsupported
      }

      await refreshCart();
      setDemoPaymentModalOpen(false);
      showToast('Order placed successfully!', 'success');
      navigate(`/buyer/order-success/${res.id}`, { state: { order: res } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order. Please check stock.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
      setSimulatingPayment(false);
    }
  };

  const handleSimulateDemoPayment = () => {
    setSimulatingPayment(true);
    setTimeout(() => {
      executeOrderPlacement('ONLINE');
    }, 1200);
  };

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No items in your cart to checkout</h2>
        <Link to="/products" className="btn btn-primary btn-sm">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/buyer/cart" className="hover:text-emerald-600 flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Cart
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">Checkout</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Finalize Your Order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Delivery Address */}
          <div className="card p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={18} className="text-emerald-600" />
                <span>1. Select Delivery Address</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="btn btn-outline btn-sm text-xs font-bold flex items-center gap-1.5 border-emerald-600 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
              >
                <Plus size={14} /> Add New Address
              </button>
            </div>

            {addressLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                <p className="text-sm text-slate-600">No saved delivery addresses found.</p>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="btn btn-primary btn-sm cursor-pointer"
                >
                  Add Your Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="badge badge-info text-[10px] uppercase font-bold">
                            {addr.addressType || 'HOME'}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-800 font-semibold pt-1">
                          {addr.streetAddress}
                        </p>
                        <p className="text-xs text-slate-500">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>

                      <div className="pt-3 flex items-center justify-between text-xs">
                        <span className={`font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {isSelected ? '✓ Selected for delivery' : 'Click to select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="card p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-600" />
              <span>2. Payment Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {settings.codEnabled && (
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center gap-4 ${
                    paymentMethod === 'COD'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                    <Banknote size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</h4>
                    <p className="text-xs text-slate-500">Pay cash or scan QR upon delivery</p>
                  </div>
                </div>
              )}

              {settings.onlinePaymentEnabled && (
                <div
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center gap-4 ${
                    paymentMethod === 'ONLINE'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">Demo Online Payment</h4>
                      <span className="badge badge-warning text-[9px] font-bold">Sandbox</span>
                    </div>
                    <p className="text-xs text-slate-500">Interactive simulated gateway (Card/UPI)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          <div className="card p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-5">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Order Summary ({items.length} items)
            </h2>

            {/* Mini Items preview */}
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 flex-1 truncate">
                    <img
                      src={item.productImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80'}
                      alt={item.productName}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">{item.productName}</p>
                      <p className="text-[10px] text-slate-400">Qty: {item.quantity} • {item.sellerBusinessName}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    ₹{Number(item.subtotal).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Calculation */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                {deliveryFee === 0 ? (
                  <span className="badge badge-success text-[10px] font-bold">FREE</span>
                ) : (
                  <span className="font-bold text-slate-900">₹{deliveryFee}</span>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-slate-900 block">Total Due</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Payment: {paymentMethod}</span>
                </div>
                <span className="text-2xl font-black text-slate-900">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={loading || !selectedAddressId}
              onClick={handleCheckoutClick}
              className="btn btn-primary w-full py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <span>{paymentMethod === 'ONLINE' ? 'Proceed to Demo Payment' : 'Place Order (COD)'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="pt-2 text-[11px] text-slate-500 font-semibold text-center flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Multi-Vendor Protected Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add Delivery Address"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <div className="form-group">
            <label className="form-label text-xs">Street Address / House No. *</label>
            <textarea
              required
              rows={2}
              value={newAddress.streetAddress}
              onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
              placeholder="e.g. Flat 402, Greenfield Apartments, 5th Cross"
              className="form-textarea text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-xs">City *</label>
              <input
                type="text"
                required
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                placeholder="e.g. Bangalore"
                className="form-input text-xs"
              />
            </div>
            <div className="form-group">
              <label className="form-label text-xs">State *</label>
              <input
                type="text"
                required
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                placeholder="e.g. Karnataka"
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-xs">PIN Code *</label>
              <input
                type="text"
                required
                pattern="[0-9]{6}"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                placeholder="e.g. 560001"
                className="form-input text-xs"
              />
            </div>
            <div className="form-group">
              <label className="form-label text-xs">Address Type</label>
              <select
                value={newAddress.addressType}
                onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                className="form-select text-xs"
              >
                <option value="HOME">Home</option>
                <option value="WORK">Work / Office</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="btn btn-outline btn-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingAddress}
              className="btn btn-primary btn-sm font-bold cursor-pointer"
            >
              {savingAddress ? 'Saving...' : 'Save & Select'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Demo Online Payment Sandbox Modal (Requirement 44) */}
      <Modal
        isOpen={demoPaymentModalOpen}
        onClose={() => {
          if (!simulatingPayment) setDemoPaymentModalOpen(false);
        }}
        title="Demo Online Payment Gateway"
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          {/* Explicit Demonstration Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Demonstration Payment Gateway</p>
              <p className="text-[11px] text-amber-700">
                This is a simulated sandbox for testing multi-vendor checkout without live financial charges.
              </p>
            </div>
          </div>

          {/* Amount Due Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Due</span>
              <span className="text-2xl font-black text-emerald-400">
                ₹{finalTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
              <Lock size={12} />
              <span>Simulated SSL</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="flex border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setDemoPaymentType('CARD')}
              className={`flex-1 py-2.5 text-center transition border-b-2 cursor-pointer ${
                demoPaymentType === 'CARD'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Credit / Debit Card
            </button>
            <button
              type="button"
              onClick={() => setDemoPaymentType('UPI')}
              className={`flex-1 py-2.5 text-center transition border-b-2 cursor-pointer ${
                demoPaymentType === 'UPI'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Instant UPI / QR
            </button>
          </div>

          {demoPaymentType === 'CARD' ? (
            <div className="space-y-3 text-xs">
              <div className="form-group">
                <label className="form-label text-[11px]">Test Card Number</label>
                <input
                  type="text"
                  readOnly
                  value="4242 •••• •••• 4242"
                  className="form-input bg-slate-50 font-mono text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label text-[11px]">Valid Thru</label>
                  <input
                    type="text"
                    readOnly
                    value="12 / 29"
                    className="form-input bg-slate-50 font-mono text-xs"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-[11px]">CVV</label>
                  <input
                    type="text"
                    readOnly
                    value="888"
                    className="form-input bg-slate-50 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
              <QrCode size={64} className="mx-auto text-slate-800" />
              <p className="text-xs font-bold text-slate-800">roshnamart@upi (Mock Sandbox)</p>
              <p className="text-[11px] text-slate-500">Scan or click authorize below to simulate instant payment</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={simulatingPayment}
              onClick={() => setDemoPaymentModalOpen(false)}
              className="btn btn-outline btn-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={simulatingPayment}
              onClick={handleSimulateDemoPayment}
              className="btn btn-primary btn-sm font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              {simulatingPayment ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Authorizing Gateway...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Simulate Payment & Place Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
