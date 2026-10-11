'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Send,
  DollarSign,
  MapPin,
  Phone,
  User,
  Package,
} from 'lucide-react';
import { Order } from '@/types';
import { useProducts } from '@/lib/store/productsContext';
import { useOrder } from '@/lib/store/orderContext';
import { formatPrice } from '@/lib/utils';

interface CourierDispatchModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (trackingCode: string, consignmentId: string, provider: string) => void;
}

export default function CourierDispatchModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: CourierDispatchModalProps) {
  const { siteSettings } = useProducts();
  const { updateOrderDelivery, updateOrderStatus } = useOrder();

  const courierSettings = siteSettings.courierSettings;
  const isDhaka = (order?.customer?.district || '').toLowerCase().includes('dhaka');
  const defaultProvider = isDhaka
    ? (courierSettings?.defaultCourierDhaka || 'Steadfast')
    : (courierSettings?.defaultCourierOutsideDhaka || 'Pathao');

  const [provider, setProvider] = useState<'Steadfast' | 'Pathao'>(defaultProvider);
  const [customNote, setCustomNote] = useState('');
  const [codAmount, setCodAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    trackingCode: string;
    consignmentId: string;
    trackingUrl: string;
    provider: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (order) {
      setProvider(defaultProvider);
      const isCod = order.paymentMethod === 'cod';
      setCodAmount(isCod ? order.totalAmount : 0);
      setCustomNote(`Jeans BD - Order #${order.orderNumber}`);
      setError(null);
      setSuccessData(null);
    }
  }, [order, defaultProvider]);

  if (!isOpen || !order) return null;

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/courier/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order,
          courier: provider,
          customNote: customNote.trim(),
          codAmount: Number(codAmount),
        }),
      });

      const data = await res.json();

      if (data.success) {
        const tracking = data.trackingCode || data.consignmentId || '';
        const cid = data.consignmentId || data.trackingCode || '';
        const providerName = provider === 'Steadfast' ? 'Steadfast Courier' : 'Pathao Express';

        // Update local order delivery
        updateOrderDelivery(order.id, {
          courierCompany: providerName,
          trackingNumber: tracking,
          trackingCode: tracking,
          consignmentId: cid,
          trackingUrl: data.trackingUrl || '',
          deliveryStatus: 'In Transit',
          courierStatus: 'Dispatched to Hub',
          dispatchedAt: new Date().toISOString(),
        });

        // Update order status to Shipped if it was Pending or Confirmed
        if (order.orderStatus === 'Pending' || order.orderStatus === 'Confirmed' || order.orderStatus === 'Processing') {
          updateOrderStatus(order.id, 'Shipped', `Dispatched via ${providerName} (Tracking: ${tracking})`);
        }

        setSuccessData({
          trackingCode: tracking,
          consignmentId: cid,
          trackingUrl: data.trackingUrl || '',
          provider: providerName,
        });

        if (onSuccess) {
          onSuccess(tracking, cid, providerName);
        }
      } else {
        setError(data.message || 'Failed to dispatch parcel. Please check Courier API settings.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error connecting to courier service.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">
                Dispatch to Courier via API
              </h3>
              <p className="text-xs text-slate-400">
                Order <span className="font-mono font-bold text-blue-400">#{order.orderNumber}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Success Result View */}
          {successData ? (
            <div className="space-y-5 text-center py-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">Consignment Successfully Booked!</h4>
                <p className="text-xs text-slate-400">
                  Parcel created in <strong className="text-white">{successData.provider}</strong> system.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Tracking Code:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-emerald-400">
                      {successData.trackingCode}
                    </span>
                    <button
                      onClick={() => handleCopy(successData.trackingCode)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {successData.consignmentId !== successData.trackingCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Consignment ID:</span>
                    <span className="font-mono text-xs text-slate-300">{successData.consignmentId}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                {successData.trackingUrl && (
                  <a
                    href={successData.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Track on Portal</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDispatch} className="space-y-5">
              {/* Recipient summary */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{order.customer.fullName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-mono">{order.customer.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    {order.customer.address}, {order.customer.area}, {order.customer.district}
                  </span>
                </div>
              </div>

              {/* Courier selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Select Courier Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProvider('Steadfast')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      provider === 'Steadfast'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm">Steadfast Courier</span>
                      {provider === 'Steadfast' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1">API Key Integration</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvider('Pathao')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      provider === 'Pathao'
                        ? 'bg-rose-500/10 border-rose-500 text-white shadow-lg shadow-rose-500/10'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm">Pathao Express</span>
                      {provider === 'Pathao' && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1">Merchant OAuth Client</span>
                  </button>
                </div>
              </div>

              {/* COD Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>COD Collection Amount (৳)</span>
                  <span className="text-[11px] text-slate-500 normal-case">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid (৳0 to collect)'}
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    ৳
                  </div>
                  <input
                    type="number"
                    value={codAmount}
                    onChange={(e) => setCodAmount(Number(e.target.value))}
                    min={0}
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl text-xs font-mono font-bold bg-slate-950/80 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              {/* Delivery Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Delivery Instruction / Note
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Call before delivery, handle with care"
                  className="w-full px-4 py-2.5 rounded-2xl text-xs bg-slate-950/80 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              {/* Error box */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 px-5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                    provider === 'Steadfast'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending to {provider}...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch to {provider} Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
