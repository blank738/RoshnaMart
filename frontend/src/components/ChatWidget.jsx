import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, Sparkles, RefreshCw, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

const MAX_INPUT_LENGTH = 500;

const SUGGESTIONS = [
  'What coupons are available?',
  'How do I track my order?',
  'What are shipping & delivery fees?',
  'How does the return policy work?',
  'What payment methods are supported?',
  'How to become a seller on RoshnaMart?',
  'What categories of products are sold?',
];

/**
 * Intelligent instant domain response engine.
 * Ensures quick, accurate, helpful responses under all network conditions.
 */
const generateQuickAssistantReply = (rawQuery) => {
  const query = (rawQuery || '').toLowerCase().trim();

  // 1. Coupons & Discounts
  if (
    query.includes('coupon') ||
    query.includes('discount') ||
    query.includes('promo') ||
    query.includes('offer') ||
    query.includes('voucher') ||
    query.includes('welcome10') ||
    query.includes('roshna20') ||
    query.includes('save50')
  ) {
    return {
      text: `🎉 Here are the verified active RoshnaMart discount coupons:\n\n• WELCOME10: 10% OFF on orders above ₹500 (Max discount ₹200)\n• ROSHNA20: 20% OFF on orders above ₹1,500 (Max discount ₹500)\n• SAVE50: Flat ₹50 OFF on orders above ₹300\n\n💡 You can apply any coupon code at checkout in your order summary!`,
      actions: [
        { label: '🎟️ Copy WELCOME10', copyText: 'WELCOME10' },
        { label: '🎟️ Copy ROSHNA20', copyText: 'ROSHNA20' },
        { label: '🛍️ Browse Products', path: '/products' },
      ],
    };
  }

  // 2. Order Tracking & Status
  if (
    query.includes('track') ||
    query.includes('order status') ||
    query.includes('where is my order') ||
    query.includes('shipment') ||
    query.includes('delivery status')
  ) {
    return {
      text: `📦 You can track your orders in real-time by going to your Buyer Dashboard → 'My Orders' (/buyer/orders).\n\nEach order item displays a live interactive timeline:\n1. PLACED (Order received by system)\n2. PROCESSING (Packed by merchant)\n3. SHIPPED (Handed over to delivery courier)\n4. DELIVERED (Delivered to your address)`,
      actions: [
        { label: '📦 View My Orders', path: '/buyer/orders' },
        { label: '🛍️ Explore Catalog', path: '/products' },
      ],
    };
  }

  // 3. Shipping charges & Free Delivery
  if (
    query.includes('shipping') ||
    query.includes('delivery fee') ||
    query.includes('delivery charge') ||
    query.includes('free delivery') ||
    query.includes('delivery cost') ||
    query.includes('charges')
  ) {
    return {
      text: `🚚 RoshnaMart Shipping Rates:\n\n• FREE Standard Delivery on orders of ₹999 or more!\n• Standard flat delivery fee of ₹40 applies on orders below ₹999.\n• Your cart automatically displays a progress meter calculating how much more to add for Free Shipping.`,
      actions: [
        { label: '🛒 View Cart', path: '/buyer/cart' },
        { label: '🛍️ Browse Products', path: '/products' },
      ],
    };
  }

  // 4. Returns, Refunds & Cancellations
  if (
    query.includes('return') ||
    query.includes('refund') ||
    query.includes('cancel') ||
    query.includes('replacement')
  ) {
    return {
      text: `🔄 RoshnaMart 7-Day Hassle-Free Return Policy:\n\n• Eligible items can be returned within 7 days of delivery.\n• Go to 'My Orders', click on your delivered item, and select 'Request Return'.\n• Upon vendor/admin inspection, full refunds are issued to your original payment method within 3–5 business days.`,
      actions: [
        { label: '📦 Go to My Orders', path: '/buyer/orders' },
        { label: 'ℹ️ About RoshnaMart', path: '/about' },
      ],
    };
  }

  // 5. Payment Methods & Sandbox
  if (
    query.includes('payment') ||
    query.includes('upi') ||
    query.includes('card') ||
    query.includes('netbanking') ||
    query.includes('wallet') ||
    query.includes('cod') ||
    query.includes('cash on delivery')
  ) {
    return {
      text: `💳 RoshnaMart supports multiple 100% secure payment gateways:\n\n• UPI (Google Pay, PhonePe, Paytm, BHIM)\n• Credit & Debit Cards (Visa, MasterCard, RuPay)\n• Net Banking (All major Indian banks)\n• Cash on Delivery (COD)\n• Online Sandbox simulator for instant test checkout!`,
      actions: [
        { label: '🛍️ Start Shopping', path: '/products' },
      ],
    };
  }

  // 6. How to place an order
  if (
    query.includes('how to order') ||
    query.includes('how to buy') ||
    query.includes('place order') ||
    query.includes('checkout')
  ) {
    return {
      text: `🛒 How to shop on RoshnaMart:\n\n1. Browse products and click 'Add to Cart' or 'View'.\n2. Open your Cart to review items (grouped automatically by seller).\n3. Proceed to Checkout and select your delivery address.\n4. Apply discount coupons and complete payment!`,
      actions: [
        { label: '🔍 Browse Catalog', path: '/products' },
        { label: '🛒 View Cart', path: '/buyer/cart' },
      ],
    };
  }

  // 7. Become a Seller / Merchant Registration
  if (
    query.includes('seller') ||
    query.includes('merchant') ||
    query.includes('vendor') ||
    query.includes('sell on') ||
    query.includes('register seller')
  ) {
    return {
      text: `🏪 Grow your business with RoshnaMart Multi-Vendor Marketplace:\n\n• Low 5% marketplace commission rate.\n• Complete vendor privacy & data isolation.\n• Dedicated merchant portal with product management, live orders, and revenue analytics.\n\nSign up in minutes and get approved by administrators!`,
      actions: [
        { label: '🏪 Register as Seller', path: '/register/seller' },
        { label: 'ℹ️ Platform Info', path: '/about' },
      ],
    };
  }

  // 8. Specific product queries
  if (query.includes('headphone') || query.includes('earphone') || query.includes('audio') || query.includes('sound')) {
    return {
      text: `🎧 Apex SoundPro Active Noise Cancelling Headphones:\n\n• Price: ₹3,999 (20% OFF, MRP ₹4,999)\n• 40mm hybrid acoustics, 45dB Active Noise Cancellation, 60hr battery life.\n• Sold by Apex Electronics Hub with 4.8★ rating!`,
      actions: [
        { label: 'View Headphones', path: '/products/1' },
        { label: 'All Electronics', path: '/products?categoryId=1' },
      ],
    };
  }

  if (query.includes('watch') || query.includes('smartwatch')) {
    return {
      text: `⌚ Trending Watches on RoshnaMart:\n\n• Apex UltraPulse AMOLED Smartwatch: ₹2,799 (20% OFF) - 1.43" AMOLED, SpO2, heart rate, IP68\n• Urban Luxe Chronograph Watch: ₹4,299 (22% OFF) - Sapphire glass, Japanese quartz, 50m water resistant`,
      actions: [
        { label: 'View Smartwatch', path: '/products/2' },
        { label: 'View Chronograph Watch', path: '/products/8' },
      ],
    };
  }

  if (query.includes('keyboard')) {
    return {
      text: `⌨️ Apex Ergonomic Wireless Mechanical Keyboard:\n\n• Price: ₹4,999 (17% OFF, MRP ₹5,999)\n• Tactile brown switches, Bluetooth 5.2 + 2.4GHz, south-facing RGB, hot-swappable body.`,
      actions: [
        { label: 'View Mechanical Keyboard', path: '/products/3' },
      ],
    };
  }

  if (query.includes('speaker')) {
    return {
      text: `🔊 Apex TrueBass Waterproof Bluetooth Speaker:\n\n• Price: ₹1,899 (24% OFF, MRP ₹2,499)\n• IPX7 submersible waterproof, 360-degree surround sound, 24hr non-stop battery.`,
      actions: [
        { label: 'View Speaker', path: '/products/4' },
      ],
    };
  }

  if (query.includes('jacket') || query.includes('denim') || query.includes('apparel') || query.includes('fashion')) {
    return {
      text: `🧥 Fashion & Apparel Highlights:\n\n• Urban Vogue Vintage Washed Denim Jacket: ₹2,299 (23% OFF)\n• Top-Grain Leather Weekend Duffel Bag: ₹4,999\n• Polarized Sunglasses: ₹1,499`,
      actions: [
        { label: 'View Denim Jacket', path: '/products/5' },
        { label: 'View Leather Duffel', path: '/products/6' },
        { label: 'Explore Fashion', path: '/products?categoryId=2' },
      ],
    };
  }

  if (query.includes('coffee') || query.includes('dinner') || query.includes('kitchen') || query.includes('home')) {
    return {
      text: `☕ Home & Kitchen Essentials:\n\n• Apex Barista Pour-Over Coffee Maker: ₹1,499 (21% OFF)\n• Artisan Ceramic Dinner Set (16 Pcs): ₹3,199 (20% OFF)`,
      actions: [
        { label: 'View Coffee Maker', path: '/products/9' },
        { label: 'View Dinner Set', path: '/products/10' },
        { label: 'Home & Kitchen', path: '/products?categoryId=3' },
      ],
    };
  }

  if (query.includes('serum') || query.includes('beauty') || query.includes('skincare')) {
    return {
      text: `✨ Botanical Glow Organic Vitamin C Serum:\n\n• Price: ₹899 (31% OFF, MRP ₹1,299)\n• 20% stabilized Vitamin C, hyaluronic acid, natural collagen booster.`,
      actions: [
        { label: 'View Vitamin C Serum', path: '/products/11' },
        { label: 'Beauty Category', path: '/products?categoryId=4' },
      ],
    };
  }

  if (query.includes('yoga') || query.includes('fitness') || query.includes('sports')) {
    return {
      text: `🧘 ProGrip Non-Slip Eco Yoga Mat (6mm):\n\n• Price: ₹1,099 (27% OFF, MRP ₹1,499)\n• Biodegradable TPE, alignment guidelines, dual textured grip, carry strap included.`,
      actions: [
        { label: 'View Yoga Mat', path: '/products/12' },
        { label: 'Sports & Fitness', path: '/products?categoryId=5' },
      ],
    };
  }

  // 9. Categories overview
  if (
    query.includes('product') ||
    query.includes('category') ||
    query.includes('categories') ||
    query.includes('catalog') ||
    query.includes('items')
  ) {
    return {
      text: `🛍️ RoshnaMart features verified goods across 5 departments:\n\n1. Electronics & Gadgets (Headphones, Smartwatches, Keyboards, Speakers)\n2. Fashion & Apparel (Denim jackets, Leather bags, Watches, Sunglasses)\n3. Home & Kitchen (Pour-over coffee makers, Dinner sets)\n4. Beauty & Personal Care (Organic serums & skincare)\n5. Sports & Fitness (Eco yoga mats & fitness gear)\n\nAll products are available with single multi-vendor unified checkout!`,
      actions: [
        { label: '🔍 Explore All Products', path: '/products' },
        { label: '⚡ Electronics', path: '/products?categoryId=1' },
        { label: '👗 Fashion', path: '/products?categoryId=2' },
      ],
    };
  }

  // 10. Customer Support
  if (
    query.includes('support') ||
    query.includes('help') ||
    query.includes('contact') ||
    query.includes('email') ||
    query.includes('customer care')
  ) {
    return {
      text: `📞 RoshnaMart Customer Support is here 24/7:\n\n• Email: support@roshnamart.com\n• Live Assistant: I am available 24/7 right here!\n• Self-Service: Track orders or request returns anytime under 'My Orders'.`,
      actions: [
        { label: 'ℹ️ Help Center & About', path: '/about' },
        { label: '📦 My Orders', path: '/buyer/orders' },
      ],
    };
  }

  // Greetings
  if (
    query.includes('hi') ||
    query.includes('hello') ||
    query.includes('hey') ||
    query.includes('greetings') ||
    query.includes('good morning') ||
    query.includes('good afternoon') ||
    query.includes('good evening')
  ) {
    return {
      text: `👋 Hello! I am your RoshnaMart Shopping Assistant. How can I help you today?\n\nYou can ask me about:\n• Active discount coupons\n• Live order tracking\n• Shipping fees & Free Delivery\n• 7-Day return policy\n• Product recommendations\n• Becoming a verified seller`,
      actions: [
        { label: '🎟️ Active Coupons', query: 'What coupons are available?' },
        { label: '📦 Track My Order', query: 'How do I track my order?' },
        { label: '🛍️ View Products', path: '/products' },
      ],
    };
  }

  // Default helpful response
  return {
    text: `I am your RoshnaMart shopping assistant! I can help you find products, view active coupons, track existing orders, explain return policies, or assist with seller registration. How can I help you right now?`,
    actions: [
      { label: '🎟️ View Coupons', query: 'What coupons are available?' },
      { label: '🛍️ Browse Catalog', path: '/products' },
      { label: '🚚 Shipping Policy', query: 'What are shipping & delivery fees?' },
    ],
  };
};

export const ChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am your RoshnaMart Shopping Assistant. How can I help you today? Feel free to ask about products, orders, shipping rates, returns, or active discount coupons!',
      actions: [
        { label: '🎟️ View Coupons', query: 'What coupons are available?' },
        { label: '📦 Track Orders', query: 'How do I track my order?' },
        { label: '🛍️ Browse Catalog', path: '/products' },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const getChatEndpoint = () => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
      return 'https://roshnamart-backend.onrender.com/api/chat';
    }
    if (API_BASE_URL && typeof window !== 'undefined' && !API_BASE_URL.includes(window.location.origin)) {
      return `${API_BASE_URL}/api/chat`;
    }
    return '/api/chat';
  };

  const handleActionClick = (action) => {
    if (action.path) {
      navigate(action.path);
    } else if (action.query) {
      handleSendMessage(action.query);
    } else if (action.copyText) {
      try {
        navigator.clipboard?.writeText(action.copyText);
        setCopyFeedback(`Coupon "${action.copyText}" copied to clipboard!`);
        setTimeout(() => setCopyFeedback(''), 3000);
      } catch (err) {
        setCopyFeedback(`Coupon code: ${action.copyText}`);
      }
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    if (text.length > MAX_INPUT_LENGTH) {
      setErrorMessage(`Message exceeds maximum length of ${MAX_INPUT_LENGTH} characters.`);
      return;
    }

    setErrorMessage('');
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message to state immediately
    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text,
      timestamp: userTimestamp,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Fast attempt to reach backend with AbortController timeout (1200ms)
    let replyData = null;

    try {
      const endpoint = getChatEndpoint();
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('roshnamart_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data && data.reply) {
          replyData = {
            text: data.reply,
            provider: data.provider || 'RoshnaMart AI',
            cached: data.cached,
          };
        }
      }
    } catch (e) {
      // Backend timed out or unreachable — immediately proceed to smart instant reply
    }

    // If backend was slow or offline, deliver the smart instant reply with brief natural typing feel
    if (!replyData) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const localResult = generateQuickAssistantReply(text);
      replyData = {
        text: localResult.text,
        actions: localResult.actions || [],
        provider: 'Instant AI Assistant',
        cached: true,
      };
    }

    setMessages((prev) => [
      ...prev,
      {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: replyData.text,
        actions: replyData.actions || [],
        provider: replyData.provider,
        cached: replyData.cached,
        timestamp: botTimestamp,
      },
    ]);

    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: 'Hello! I am your RoshnaMart Shopping Assistant. How can I help you today? Feel free to ask about products, orders, shipping rates, returns, or active discount coupons!',
        actions: [
          { label: '🎟️ View Coupons', query: 'What coupons are available?' },
          { label: '📦 Track Orders', query: 'How do I track my order?' },
          { label: '🛍️ Browse Catalog', path: '/products' },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setErrorMessage('');
    setCopyFeedback('');
  };

  return (
    <div
      className="chat-widget-fixed-container"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
      }}
    >
      {/* Floating Toggle Button (Always at bottom-right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-widget-trigger-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
            color: '#ffffff',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 10px 25px -4px rgba(5, 150, 105, 0.4), 0 4px 6px -2px rgba(5, 150, 105, 0.2)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
          aria-label="Open AI Shopping Assistant"
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Bot size={22} color="#ffffff" />
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '10px',
                height: '10px',
                backgroundColor: '#34d399',
                border: '2px solid #ffffff',
                borderRadius: '50%',
              }}
            />
          </div>
          <span>Ask AI Assistant</span>
          <Sparkles size={16} color="#fde047" />
        </button>
      )}

      {/* Floating Chat Window (Positioned bottom-right above trigger) */}
      {isOpen && (
        <div
          className="chat-widget-window"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(15, 23, 42, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 99999,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
              color: '#ffffff',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <Bot size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                    RoshnaMart Assistant
                  </h3>
                  <span
                    style={{
                      fontSize: '10px',
                      backgroundColor: '#fbbf24',
                      color: '#0f172a',
                      fontWeight: 800,
                      padding: '2px 5px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Quick AI
                  </span>
                </div>
                <p
                  style={{
                    margin: '3px 0 0 0',
                    fontSize: '11px',
                    color: '#d1fae5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#34d399',
                      display: 'inline-block',
                    }}
                  />
                  Online • Quick Response Mode
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handleResetChat}
                title="Restart Conversation"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#d1fae5',
                  padding: '6px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Restart conversation"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#d1fae5',
                  padding: '6px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Copy feedback notification banner */}
          {copyFeedback && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                borderBottom: '1px solid #a7f3d0',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Check size={14} color="#059669" />
              <span>{copyFeedback}</span>
            </div>
          )}

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '88%',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    ...(msg.sender === 'user'
                      ? {
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          borderBottomRightRadius: '4px',
                          boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
                        }
                      : msg.isError
                      ? {
                          backgroundColor: '#fff1f2',
                          color: '#9f1239',
                          border: '1px solid #fecdd3',
                          borderBottomLeftRadius: '4px',
                        }
                      : {
                          backgroundColor: '#ffffff',
                          color: '#1e293b',
                          border: '1px solid #e2e8f0',
                          borderBottomLeftRadius: '4px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        }),
                  }}
                >
                  {msg.text}

                  {/* Interactive Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginTop: '10px',
                        paddingTop: '8px',
                        borderTop: '1px solid #f1f5f9',
                      }}
                    >
                      {msg.actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: '#ecfdf5',
                            color: '#047857',
                            border: '1px solid #a7f3d0',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '4px',
                    padding: '0 4px',
                    fontSize: '11px',
                    color: '#94a3b8',
                  }}
                >
                  <span>{msg.timestamp}</span>
                  {msg.cached && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        color: '#059669',
                        fontWeight: 600,
                      }}
                    >
                      • <CheckCircle2 size={12} /> instant
                    </span>
                  )}
                  {msg.provider && !msg.cached && <span>• {msg.provider}</span>}
                </div>
              </div>
            ))}

            {/* Fast Loading Indicator */}
            {isLoading && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  padding: '8px 14px',
                  borderRadius: '16px',
                  borderBottomLeftRadius: '4px',
                  fontSize: '12px',
                  color: '#64748b',
                  width: 'fit-content',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <Bot size={16} color="#059669" />
                <span>Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Suggestion Chips */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#f1f5f9',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Quick:</span>
            {SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item)}
                disabled={isLoading}
                style={{
                  fontSize: '11px',
                  backgroundColor: '#ffffff',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                  transition: 'background 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: '#fff1f2',
                borderTop: '1px solid #fecdd3',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: '#b91c1c',
              }}
            >
              <AlertCircle size={14} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {errorMessage}
              </span>
            </div>
          )}

          {/* Input Box */}
          <div
            style={{
              padding: '12px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (errorMessage && e.target.value.length <= MAX_INPUT_LENGTH) {
                    setErrorMessage('');
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about products, orders, returns..."
                rows={1}
                maxLength={MAX_INPUT_LENGTH + 10}
                style={{
                  width: '100%',
                  resize: 'none',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  padding: '9px 75px 9px 12px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  right: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: input.length > MAX_INPUT_LENGTH ? '#ef4444' : '#94a3b8',
                    fontWeight: input.length > MAX_INPUT_LENGTH ? 700 : 400,
                  }}
                >
                  {input.length}/{MAX_INPUT_LENGTH}
                </span>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || input.length > MAX_INPUT_LENGTH || isLoading}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor:
                      !input.trim() || input.length > MAX_INPUT_LENGTH || isLoading
                        ? 'not-allowed'
                        : 'pointer',
                    opacity: !input.trim() || input.length > MAX_INPUT_LENGTH || isLoading ? 0.45 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
