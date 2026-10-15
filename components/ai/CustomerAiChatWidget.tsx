'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  Package,
  ShoppingBag,
  HelpCircle,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';
import { useOrder } from '@/lib/store/orderContext';
import { ChatMessage } from '@/lib/services/ai/chatSupportService';

export default function CustomerAiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const { products } = useProducts();
  const { orders } = useOrder();

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          text:
            language === 'bn'
              ? 'আসসালামু আলাইকুম! **Jeans BD AI Assistant**-এ স্বাগতম।\nআমি আপনাকে ডেনিম সাইজ গাইডেন্স, সেরা জিন্স পছন্দ, স্টক যাচাই এবং লাইভ অর্ডার ট্র্যাকিং-এ সাহায্য করতে পারি। কীভাবে সাহায্য করতে পারি?'
              : 'Welcome to **Jeans BD AI Assistant**! I can assist you with denim fit guidance, product recommendations, stock availability, and live order tracking. How can I help you today?',
          timestamp: new Date().toISOString(),
          actionType: 'general',
        },
      ]);
    }
  }, [language, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
          products,
          orders,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.message) {
          setMessages((prev) => [...prev, data.message]);
        } else {
          throw new Error(data.error || 'Failed response');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text:
            language === 'bn'
              ? 'সাময়িক ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন অথবা আমাদের কাস্টমার কেয়ারে কল করুন: 01700-000000।'
              : 'We experienced a temporary connection hiccup. Please retry or contact our live care at 01700-000000.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts =
    language === 'bn'
      ? [
          '👖 আমার সাইজ কত হবে?',
          '🔥 বেস্ট সেলার জিন্স দেখাও',
          '📦 আমার অর্ডার ট্র্যাক করুন',
          '🚚 ক্যাশ অন ডেলিভারি পলিসি',
        ]
      : [
          '👖 What size should I get?',
          '🔥 Best selling denim',
          '📦 Track my order',
          '🚚 Cash on delivery details',
        ];

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 text-white pl-4 pr-5 py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-blue-500/20"
          aria-label="Open AI Assistant"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>

          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-black tracking-wider text-blue-200 leading-none">
              Jeans BD AI
            </span>
            <span className="text-xs font-black tracking-tight mt-0.5">
              {language === 'bn' ? 'সহায়তা নিন' : 'Live Stylist'}
            </span>
          </div>
        </button>
      )}

      {/* Interactive Chat Window Modal */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[400px] h-[580px] max-h-[85vh] bg-[#0c1220] border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-scale-up font-sans">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#11192e] to-[#0c1220] p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">
                    Jeans BD AI Stylist
                  </h3>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'bn' ? 'ডেনিম বিশেষজ্ঞ ও অর্ডার ট্র্যাকার' : 'Denim Expert & Order Radar'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'))}
                className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-blue-300 border border-slate-700 transition-colors"
                title="Switch Language"
              >
                {language === 'bn' ? 'EN' : 'বাংলা'}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-[#090e1a] px-3 py-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.replace(/^[^\w\u0980-\u09FF]+/, ''))}
                className="whitespace-nowrap text-[11px] bg-slate-800/90 hover:bg-blue-900/40 hover:text-blue-300 border border-slate-700/60 text-slate-300 px-2.5 py-1 rounded-full transition-all shrink-0 active:scale-95"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#090e1a]/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                      : 'bg-[#141d33] border border-slate-700/60 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Order Status Card Attachment */}
                  {msg.orderStatusCard && (
                    <div className="mt-3 p-3 bg-slate-900/90 rounded-xl border border-blue-500/30 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between font-black text-blue-400 uppercase">
                        <span>Order #{msg.orderStatusCard.orderNumber}</span>
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {msg.orderStatusCard.status}
                        </span>
                      </div>
                      <div className="text-slate-300">Total: ৳{msg.orderStatusCard.totalAmount} ({msg.orderStatusCard.itemsCount} items)</div>
                      {msg.orderStatusCard.trackingNumber && (
                        <div className="text-amber-400 font-mono text-[10px]">
                          Tracking: {msg.orderStatusCard.trackingNumber} ({msg.orderStatusCard.courier})
                        </div>
                      )}
                      <Link
                        href={`/track-order?orderId=${msg.orderStatusCard.orderNumber}`}
                        className="inline-flex items-center gap-1 text-blue-400 hover:underline pt-1 text-[11px] font-bold"
                      >
                        Full Tracking Timeline &rarr;
                      </Link>
                    </div>
                  )}

                  {/* Recommended Products Carousel Cards */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                        Recommended for you:
                      </span>
                      <div className="space-y-1.5">
                        {msg.recommendedProducts.map((p) => (
                          <Link
                            key={p.id}
                            href={`/product/${p.slug}`}
                            className="flex items-center gap-2.5 p-2 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition-all group"
                          >
                            <img
                              src={p.thumbnail}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded-lg shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[11px] font-bold text-white truncate group-hover:text-blue-400">
                                {p.name}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span className="font-black text-white">৳{p.price}</span>
                                {p.availableSizes.length > 0 && (
                                  <span>Sizes: {p.availableSizes.slice(0, 4).join(', ')}</span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#141d33] border border-slate-700/60 p-3 rounded-2xl rounded-bl-none w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span>{language === 'bn' ? 'Jeans BD AI উত্তর প্রস্তুত করছে...' : 'Jeans BD AI is analyzing...'}</span>
              </div>
            )}
          </div>

          {/* Input Box Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#0c1220] border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                language === 'bn'
                  ? 'আপনার প্রশ্ন বা অর্ডার নম্বর লিখুন...'
                  : 'Ask about sizes, denim fits, or order status...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-[#141d33] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all active:scale-95 shrink-0"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
