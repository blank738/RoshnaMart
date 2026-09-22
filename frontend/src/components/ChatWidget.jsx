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

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    if (text.length > MAX_INPUT_LENGTH) {
      setErrorMessage(`Message exceeds maximum length of ${MAX_INPUT_LENGTH} characters.`);
      return;
    }

    setErrorMessage('');
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
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
      // Image 2 Constraint: calling fetch('/api/chat', POST {message})
      let response;
      try {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: text }),
        });
      } catch (err) {
        // Fallback to API_BASE_URL if frontend is on separate origin without proxy
        if (API_BASE_URL && API_BASE_URL !== window.location.origin) {
          response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: text }),
          });
        } else {
          throw err;
        }
      }

      const data = await response.json();
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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Open AI Shopping Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
          <span className="font-semibold text-sm tracking-wide hidden sm:inline">Ask AI Assistant</span>
          <Sparkles className="w-4 h-4 text-amber-300 opacity-90 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight tracking-wide">RoshnaMart Assistant</h3>
                  <span className="text-[10px] bg-amber-400/90 text-slate-900 font-bold px-1.5 py-0.2 rounded uppercase">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-blue-100/90 flex items-center gap-1.5 leading-none mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online • Multi-Vendor Support
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart Conversation"
                className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Restart conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : msg.isError
                      ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-bl-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none shadow-sm whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Metadata timestamp & provider indicator */}
                <div className="flex items-center gap-1.5 mt-1 px-1 text-[11px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {msg.cached && (
                    <span className="inline-flex items-center gap-0.5 text-emerald-600 font-medium">
                      • <CheckCircle2 className="w-3 h-3" /> cached
                    </span>
                  )}
                  {msg.provider && !msg.cached && (
                    <span className="text-slate-400">• {msg.provider}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2.5 w-fit shadow-sm">
                <Bot className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-xs font-medium">Thinking...</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></span>
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/80 overflow-x-auto scrollbar-none flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap pl-1">FAQ:</span>
            {SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item)}
                disabled={isLoading}
                className="text-xs bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors disabled:opacity-50"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Error / Rate limit notification */}
          {errorMessage && (
            <div className="px-3 py-1.5 bg-rose-50 border-t border-rose-200 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{errorMessage}</span>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="relative flex items-center">
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
                className="w-full resize-none rounded-xl border border-slate-300 pl-3.5 pr-20 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
              />

              <div className="absolute right-2 flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-mono ${
                    input.length > MAX_INPUT_LENGTH ? 'text-rose-500 font-bold' : 'text-slate-400'
                  }`}
                >
                  {input.length}/{MAX_INPUT_LENGTH}
                </span>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || input.length > MAX_INPUT_LENGTH || isLoading}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
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
