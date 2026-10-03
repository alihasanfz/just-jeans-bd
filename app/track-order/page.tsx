'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  PhoneCall,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useOrder } from '@/lib/store/orderContext';
import { formatPrice } from '@/lib/utils';
import { OrderStatus } from '@/types';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const { findOrderForTracking, getOrderByOrderNumber } = useOrder();

  const initialOrderParam = searchParams.get('order') || '';
  const initialPhoneParam = searchParams.get('phone') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderParam);
  const [phone, setPhone] = useState(initialPhoneParam);
  const [searched, setSearched] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<any>(null);

  // Auto-search if query params are present
  useEffect(() => {
    if (initialOrderParam) {
      if (initialPhoneParam) {
        const found = findOrderForTracking(initialOrderParam, initialPhoneParam);
        setTrackedOrder(found || null);
      } else {
        const found = getOrderByOrderNumber(initialOrderParam);
        setTrackedOrder(found || null);
      }
      setSearched(true);
    }
  }, [initialOrderParam, initialPhoneParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    if (phone.trim()) {
      const found = findOrderForTracking(orderNumber.trim(), phone.trim());
      setTrackedOrder(found || null);
    } else {
      const found = getOrderByOrderNumber(orderNumber.trim());
      setTrackedOrder(found || null);
    }
    setSearched(true);
  };

  const steps: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Ready to Ship',
    'Shipped',
    'Delivered',
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Confirmed':
        return 1;
      case 'Processing':
        return 2;
      case 'Ready to Ship':
        return 3;
      case 'Shipped':
      case 'Out for Delivery':
        return 4;
      case 'Delivered':
        return 5;
      case 'Cancelled':
      case 'Returned':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = trackedOrder ? getStepIndex(trackedOrder.orderStatus) : 0;

  return (
    <div className="bg-slate-50/50 py-12 lg:py-20 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-3">
            <Truck className="w-3.5 h-3.5" />
            <span>Real-Time Parcel Tracking</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-950 uppercase tracking-tight mb-2">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your order number and mobile phone number to check live delivery progress.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-md mb-10">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Order Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. JBD-84920"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 01711223344"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-end sm:col-span-1">
              <button
                type="submit"
                className="w-full bg-slate-950 hover:bg-black text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>💡 Try demo order: <strong className="text-blue-600 cursor-pointer" onClick={() => setOrderNumber('JBD-84920')}>JBD-84920</strong></span>
            <a href="tel:01775743148" className="hover:text-blue-600 transition-colors">Helpline: 01775743148</a>
          </div>
        </div>

        {/* Tracking Results */}
        {searched && (
          <div>
            {!trackedOrder ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-3 animate-fade-in">
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Order Not Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't locate an order with number <strong>"{orderNumber}"</strong>. Please verify the order number on your invoice SMS.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 lg:p-10 border border-slate-200/80 shadow-lg space-y-8 animate-fade-in">
                {/* Status Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
                      Tracking Summary
                    </span>
                    <h2 className="text-2xl font-black text-slate-950 mt-0.5">
                      Order #{trackedOrder.orderNumber}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Placed on {new Date(trackedOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 font-semibold block mb-0.5">Current Status</span>
                    <span
                      className={`font-black text-sm px-3.5 py-1.5 rounded-full inline-block border ${
                        trackedOrder.orderStatus === 'Cancelled'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : trackedOrder.orderStatus === 'Returned'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : trackedOrder.orderStatus === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}
                    >
                      {trackedOrder.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Visual Step Tracker or Cancelled Notice */}
                {trackedOrder.orderStatus === 'Cancelled' || trackedOrder.orderStatus === 'Returned' ? (
                  <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                    <div className="text-xs space-y-1">
                      <strong className="block text-sm font-black text-red-900">
                        Order #{trackedOrder.orderNumber} has been {trackedOrder.orderStatus.toLowerCase()}
                      </strong>
                      <p className="text-red-700">
                        If you have questions regarding this order cancellation or wish to place a replacement order, please call our customer support helpline directly at <a href="tel:01775743148" className="underline font-bold">01775743148</a>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="relative flex items-center justify-between">
                      {/* Connecting Bar */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 w-full z-0" />
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 z-0"
                        style={{
                          width: `${Math.min(100, Math.max(0, (currentStepIdx / (steps.length - 1)) * 100))}%`,
                        }}
                      />

                      {steps.map((step, idx) => {
                        const isCompleted = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={step} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                isCompleted
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                  : 'bg-white border-2 border-slate-200 text-slate-400'
                              } ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}`}
                            >
                              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] sm:text-xs font-bold mt-2 text-center max-w-16 sm:max-w-20 leading-tight ${
                                isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Courier and Dispatch Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">Assigned Courier</span>
                    <span className="font-bold text-slate-900">
                      {trackedOrder.delivery.courierCompany || 'Steadfast Courier'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">Tracking Number</span>
                    <span className="font-bold text-blue-600 font-mono">
                      {trackedOrder.delivery.trackingNumber || 'Pending Dispatch Assignment'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">Delivery Destination</span>
                    <span className="font-bold text-slate-900">
                      {trackedOrder.customer.area}, {trackedOrder.customer.district}
                    </span>
                  </div>
                </div>

                {/* Timeline Status History */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
                    Order Activity Timeline
                  </h3>
                  <div className="space-y-4 border-l-2 border-slate-200 ml-3 pl-5">
                    {trackedOrder.statusHistory?.map((hist: any, i: number) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-900">{hist.status}</h4>
                          <span className="text-[11px] text-slate-400">
                            {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(hist.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {hist.note && (
                          <p className="text-xs text-slate-500 mt-0.5">{hist.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items in this order */}
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
                    Items in Shipment
                  </h3>
                  <div className="divide-y divide-slate-100">
                    {trackedOrder.items.map((it: any) => (
                      <div key={it.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img src={it.image} alt={it.name} className="w-10 h-12 rounded-lg object-cover bg-slate-100" />
                          <div>
                            <span className="font-bold text-slate-900">{it.name}</span>
                            <div className="text-slate-400 text-[11px]">
                              Size: {it.size} • Color: {it.color} • Qty: {it.quantity}
                            </div>
                          </div>
                        </div>
                        <span className="font-black text-slate-900">{formatPrice(it.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-bold">Loading Order Tracking...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
