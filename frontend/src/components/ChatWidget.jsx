import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
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

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am your RoshnaMart Shopping Assistant. How can I help you today? Feel free to ask about products, orders, shipping rates, returns, or active discount coupons!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
    // 1. If deployed on Render static site (SPA catch-all), route to Render backend directly
    if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
      return 'https://roshnamart-backend.onrender.com/api/chat';
    }
    // 2. If API_BASE_URL is configured and different from current origin
    if (API_BASE_URL && typeof window !== 'undefined' && !API_BASE_URL.includes(window.location.origin)) {
      return `${API_BASE_URL}/api/chat`;
    }
    // 3. Otherwise use relative /api/chat (works with Vite proxy and Nginx reverse proxy)
    return '/api/chat';
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

    // Add user message to state
    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text,
      timestamp: userTimestamp,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const endpoint = getChatEndpoint();
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('roshnamart_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text }),
      });

      // If relative fetch returned HTML because of SPA fallback route, retry with Render backend
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html') && endpoint === '/api/chat') {
        const fallbackUrl = API_BASE_URL
          ? `${API_BASE_URL}/api/chat`
          : 'https://roshnamart-backend.onrender.com/api/chat';
        response = await fetch(fallbackUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: text }),
        });
      }

      const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (response.status === 429) {
        setErrorMessage('Rate limit reached: Maximum 10 messages per minute. Please wait a moment.');
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: '⚠️ Rate limit reached (10 messages per minute). Please wait a moment before asking your next question.',
            timestamp: botTimestamp,
            isError: true,
          },
        ]);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        const errorText = data.error || 'Unable to process your question at this moment.';
        setErrorMessage(errorText);
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: `⚠️ ${errorText}`,
            timestamp: botTimestamp,
            isError: true,
          },
        ]);
        return;
      }

      // Successful reply from ChatServlet
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: data.reply || 'Thank you for contacting RoshnaMart.',
          provider: data.provider,
          cached: data.cached,
          timestamp: botTimestamp,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: 'Our assistant is temporarily operating in degraded mode. For immediate questions about orders or listings, please browse our product catalog or visit the Help Center.',
          timestamp: botTimestamp,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setErrorMessage('');
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
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '550px',
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
                    AI
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
                  Online • Multi-Vendor Assistant
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
                    maxWidth: '85%',
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
                      • <CheckCircle2 size={12} /> cached
                    </span>
                  )}
                  {msg.provider && !msg.cached && <span>• {msg.provider}</span>}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
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
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>FAQ:</span>
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
