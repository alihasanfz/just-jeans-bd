'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Copy,
  Check,
  Phone,
  MessageSquare,
  Package,
  Truck,
  MapPin,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useProducts } from '@/lib/store/productsContext';

interface CustomerMessageModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  initialChannel?: 'whatsapp' | 'messenger';
}

export function formatWhatsAppPhone(phone: string): string {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '88' + clean;
  } else if (!clean.startsWith('880') && clean.length === 10) {
    clean = '880' + clean;
  }
  return clean;
}

export default function CustomerMessageModal({
  order,
  isOpen,
  onClose,
  initialChannel = 'whatsapp',
}: CustomerMessageModalProps) {
  const { siteSettings } = useProducts();
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'messenger'>(initialChannel);
  const [activeTemplate, setActiveTemplate] = useState<string>('confirmed');
  const [customText, setCustomText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveChannel(initialChannel);
  }, [initialChannel, isOpen]);

  // Generate templates when order or template changes
  useEffect(() => {
    if (!order) return;

    const custName = order.customer?.fullName || 'Customer';
    const orderNum = order.orderNumber || '';
    const amount = formatPrice(order.totalAmount || 0);
    const district = order.customer?.district || 'Dhaka';
    const address = order.customer?.address || '';
    const payment = order.paymentMethod === 'bkash' ? 'bKash' : 'Cash on Delivery (COD)';
    const siteName = siteSettings?.siteName || 'Jeans BD';
    const courier = order.delivery?.courierCompany || 'Steadfast Courier';

    let msg = '';
    switch (activeTemplate) {
      case 'confirmed':
        msg = `আসসালামু আলাইকুম ${custName}!\n\n${siteName} থেকে আপনার অর্ডার #${orderNum} কনফার্ম করা হয়েছে।\n\n📦 মোট অর্ডারের মূল্য: ${amount}\n💳 পেমেন্ট পদ্ধতি: ${payment}\n📍 ডেলিভারি ঠিকানা: ${address}, ${district}\n\nখুব শীঘ্রই পার্সেলটি ডেলিভারির জন্য পাঠানো হবে। কোনো প্রশ্ন থাকলে আমাদের জানাতে পারেন।\nধন্যবাদ!`;
        break;
      case 'shipped':
        msg = `আসসালামু আলাইকুম ${custName}!\n\nআপনার ${siteName} অর্ডার #${orderNum} সফলভাবে কুরিয়ারে (${courier}) হ্যান্ডওভার করা হয়েছে।\n\n💰 ক্যাশ অন ডেলিভারি বকেয়া: ${payment === 'bKash' ? 'পরিশোধিত (৳0)' : amount}\n🚚 কুরিয়ার রাইডার খুব শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করবে।\n\nপার্সেল গ্রহণের সময় দেখে নিন। ধন্যবাদ!`;
        break;
      case 'address':
        msg = `আসসালামু আলাইকুম ${custName}!\n\n${siteName} থেকে আপনার অর্ডার #${orderNum} এর ব্যাপারে যোগাযোগ করছি। আপনার পার্সেল পাঠানোর আগে ডেলিভারি ঠিকানা নিশ্চিত করতে চাই:\n\n📍 ঠিকানা: ${address}, ${district}\n📞 ফোন: ${order.customer?.phone}\n\nসবকিছু কি সঠিক আছে? দয়া করে মেসেজে রিপ্লাই দিয়ে নিশ্চিত করুন। ধন্যবাদ!`;
        break;
      case 'delivery_reminder':
        msg = `প্রিয় ${custName},\n\nআপনার ${siteName} অর্ডার #${orderNum} আজকে ডেলিভারির জন্য আউট রয়েছে। অনুগ্রহ করে ফোন সচল রাখুন।\n\nমোট প্রদেয়: ${amount} (${payment})\nধন্যবাদ!`;
        break;
      case 'custom':
        if (!customText) {
          msg = `আসসালামু আলাইকুম ${custName}, ${siteName} থেকে আপনার অর্ডার #${orderNum} এর ব্যাপারে যোগাযোগ করছি।`;
        } else {
          msg = customText;
        }
        break;
      default:
        msg = `আসসালামু আলাইকুম ${custName}, ${siteName} থেকে যোগাযোগ করছি। অর্ডার #${orderNum} সংক্রান্ত।`;
    }
    setCustomText(msg);
  }, [order, activeTemplate, siteSettings]);

  if (!isOpen || !order) return null;

  const phoneFormatted = formatWhatsAppPhone(order.customer?.phone || '');
  const whatsAppUrl = `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(customText)}`;
  
  // Facebook Messenger link: try page handle, fallback to m.me/jeansbd
  const fbLink = siteSettings?.socialLinks?.facebook || 'https://facebook.com/jeansbd';
  let fbHandle = 'jeansbd';
  const match = fbLink.match(/(?:facebook\.com|fb\.me|m\.me)\/([a-zA-Z0-9.]+)/);
  if (match && match[1]) fbHandle = match[1];
  const messengerUrl = `https://m.me/${fbHandle}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    window.open(whatsAppUrl, '_blank');
  };

  const handleOpenMessenger = () => {
    handleCopy();
    window.open(messengerUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
              activeChannel === 'whatsapp'
                ? 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30'
                : 'bg-[#0084FF]/20 text-[#0084FF] border border-[#0084FF]/30'
            }`}>
              {activeChannel === 'whatsapp' ? (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.983.541 1.879.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm3.385 8.163c-.144.405-.837.774-1.17.822-.312.043-.681.077-2.203-.554-1.944-.805-3.18-2.778-3.277-2.907-.097-.129-.788-1.047-.788-1.996 0-.949.499-1.417.676-1.611.178-.194.388-.242.517-.242.13 0 .259.002.371.008.119.006.278-.045.435.334.162.388.55 1.341.599 1.438.048.097.081.21.016.339-.065.129-.097.21-.194.323-.097.113-.205.253-.293.34-.097.097-.198.202-.085.396.113.194.502.828 1.078 1.342.741.661 1.365.865 1.559.962.194.097.307.081.42-.048.113-.129.484-.565.613-.759.129-.194.258-.162.436-.097.178.065 1.13.533 1.324.63.194.097.323.145.371.226.048.081.048.469-.096.874zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.176L2 22l4.981-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.636 0-3.167-.488-4.453-1.327l-.319-.209-2.955.775.789-2.88-.23-.366A8.136 8.136 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.512 3.735 7.151V22l3.414-1.874c.905.251 1.864.387 2.851.387 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.002 12.441l-2.56-2.73-5 2.73 5.5-5.84 2.62 2.73 4.94-2.73-5.5 5.84z"/>
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Direct Customer Message</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                  {order.orderNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Message {order.customer?.fullName} on WhatsApp or Facebook Messenger
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Summary Bar */}
        <div className="px-5 py-3 bg-slate-900/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white">{order.customer?.fullName}</span>
            <span className="text-slate-400 font-mono flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" />
              {order.customer?.phone}
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-400" />
              {order.customer?.district}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-black text-white">{formatPrice(order.totalAmount)}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-slate-800 text-slate-300 border border-slate-700">
              {order.paymentMethod === 'bkash' ? 'bKash' : 'COD'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {order.orderStatus}
            </span>
          </div>
        </div>

        {/* Channel Switcher */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActiveChannel('whatsapp')}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl font-black text-xs transition-all border cursor-pointer ${
                activeChannel === 'whatsapp'
                  ? 'bg-[#25D366] text-white border-[#25D366] shadow-lg shadow-[#25D366]/25 scale-[1.01]'
                  : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-slate-800'
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.983.541 1.879.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm3.385 8.163c-.144.405-.837.774-1.17.822-.312.043-.681.077-2.203-.554-1.944-.805-3.18-2.778-3.277-2.907-.097-.129-.788-1.047-.788-1.996 0-.949.499-1.417.676-1.611.178-.194.388-.242.517-.242.13 0 .259.002.371.008.119.006.278-.045.435.334.162.388.55 1.341.599 1.438.048.097.081.21.016.339-.065.129-.097.21-.194.323-.097.113-.205.253-.293.34-.097.097-.198.202-.085.396.113.194.502.828 1.078 1.342.741.661 1.365.865 1.559.962.194.097.307.081.42-.048.113-.129.484-.565.613-.759.129-.194.258-.162.436-.097.178.065 1.13.533 1.324.63.194.097.323.145.371.226.048.081.048.469-.096.874zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.176L2 22l4.981-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.636 0-3.167-.488-4.453-1.327l-.319-.209-2.955.775.789-2.88-.23-.366A8.136 8.136 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z"/>
              </svg>
              <span>WhatsApp Direct</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChannel('messenger')}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl font-black text-xs transition-all border cursor-pointer ${
                activeChannel === 'messenger'
                  ? 'bg-gradient-to-r from-[#0084FF] to-[#A824F3] text-white border-transparent shadow-lg shadow-[#0084FF]/25 scale-[1.01]'
                  : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-slate-800'
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.512 3.735 7.151V22l3.414-1.874c.905.251 1.864.387 2.851.387 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.002 12.441l-2.56-2.73-5 2.73 5.5-5.84 2.62 2.73 4.94-2.73-5.5 5.84z"/>
              </svg>
              <span>Facebook Messenger</span>
            </button>
          </div>

          {/* Quick Templates Selector */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 mb-2 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Ready-Made Message Template</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'confirmed', label: 'Order Confirmed', icon: Package },
                { id: 'shipped', label: 'Courier Shipped', icon: Truck },
                { id: 'address', label: 'Verify Address', icon: MapPin },
                { id: 'delivery_reminder', label: 'Delivery Today', icon: Phone },
                { id: 'custom', label: 'Custom Message', icon: MessageSquare },
              ].map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = activeTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setActiveTemplate(tpl.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Message Content (Edit Before Sending)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-bold text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={6}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl p-3.5 text-white text-xs leading-relaxed font-sans focus:outline-none transition-all resize-none"
              placeholder="Write your custom message here..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <a
            href={`tel:${order.customer?.phone}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Call: {order.customer?.phone}</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            {activeChannel === 'whatsapp' ? (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-[#25D366] hover:bg-[#20ba59] text-white shadow-lg shadow-[#25D366]/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.983.541 1.879.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm3.385 8.163c-.144.405-.837.774-1.17.822-.312.043-.681.077-2.203-.554-1.944-.805-3.18-2.778-3.277-2.907-.097-.129-.788-1.047-.788-1.996 0-.949.499-1.417.676-1.611.178-.194.388-.242.517-.242.13 0 .259.002.371.008.119.006.278-.045.435.334.162.388.55 1.341.599 1.438.048.097.081.21.016.339-.065.129-.097.21-.194.323-.097.113-.205.253-.293.34-.097.097-.198.202-.085.396.113.194.502.828 1.078 1.342.741.661 1.365.865 1.559.962.194.097.307.081.42-.048.113-.129.484-.565.613-.759.129-.194.258-.162.436-.097.178.065 1.13.533 1.324.63.194.097.323.145.371.226.048.081.048.469-.096.874zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.176L2 22l4.981-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.636 0-3.167-.488-4.453-1.327l-.319-.209-2.955.775.789-2.88-.23-.366A8.136 8.136 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z"/>
                </svg>
                <span>Send via WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenMessenger}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#0084FF] to-[#A824F3] hover:from-[#0074e0] hover:to-[#961fe0] text-white shadow-lg shadow-[#0084FF]/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.512 3.735 7.151V22l3.414-1.874c.905.251 1.864.387 2.851.387 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.002 12.441l-2.56-2.73-5 2.73 5.5-5.84 2.62 2.73 4.94-2.73-5.5 5.84z"/>
                </svg>
                <span>Copy &amp; Open Messenger</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
