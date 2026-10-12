'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import {
  Truck,
  ShieldCheck,
  Zap,
  Server,
  Layers,
  ExternalLink,
  Package,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Key,
  Database,
  RefreshCw,
  Send,
  Check,
  Copy,
  MapPin,
  Building,
  Sliders,
  Globe,
  AlertCircle,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useAdminTheme } from '@/lib/store/adminThemeContext';
import { useProducts } from '@/lib/store/productsContext';
import { useOrder } from '@/lib/store/orderContext';
import CourierSettingsManager from '@/components/admin/CourierSettingsManager';
import CourierDispatchModal from '@/components/admin/CourierDispatchModal';
import CourierTrackingModal from '@/components/admin/CourierTrackingModal';
import { Order } from '@/types';

export default function AdminCourierPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080d1a] flex items-center justify-center p-8 text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono tracking-widest uppercase">Loading Courier Logistics Console...</span>
          </div>
        </div>
      }
    >
      <AdminCourierContent />
    </Suspense>
  );
}

function AdminCourierContent() {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';
  const { siteSettings } = useProducts();
  const { orders } = useOrder();

  const courier = siteSettings?.courierSettings;
  const sfConfigured = Boolean(courier?.steadfast?.apiKey && courier?.steadfast?.secretKey);
  const pathaoConfigured = Boolean(courier?.pathao?.clientId && courier?.pathao?.clientSecret);

  const [activeTab, setActiveTab] = useState<'api-keys' | 'orders' | 'guide'>('api-keys');
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<Order | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [trackingModalData, setTrackingModalData] = useState<{
    open: boolean;
    courier: string;
    tracking: string;
    cid?: string;
    orderNumber?: string;
  }>({
    open: false,
    courier: '',
    tracking: '',
  });

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/courier/webhook`
      : 'https://just-jeans-bd-4ik7.vercel.app/api/courier/webhook';

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const pendingDispatchOrders = orders.filter(
    (o) => !o.delivery?.trackingNumber && !o.delivery?.consignmentId
  );
  const dispatchedOrders = orders.filter(
    (o) => o.delivery?.trackingNumber || o.delivery?.consignmentId
  );

  return (
    <div className={`p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-[#080c16] text-slate-100' : 'bg-[#f4f7fb] text-slate-800'
    }`}>
      {/* ========================================================= */}
      {/* 1. LUXURY HERO HEADER WITH DYNAMIC GRADIENTS */}
      {/* ========================================================= */}
      <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 shadow-2xl ${
        isDark
          ? 'bg-gradient-to-br from-[#0c1322] via-[#090d18] to-[#0c1322] border-slate-800/80 shadow-black/40'
          : 'bg-gradient-to-br from-white via-slate-50 to-blue-50/50 border-slate-200 shadow-slate-200/60'
      }`}>
        {/* Ambient floating glow halos */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-gradient-to-tr from-emerald-600/10 via-teal-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/25">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Logistics Console
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Steadfast • Pathao Aladdin
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Courier API Control Center
              </span>
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Steadfast Courier এবং Pathao Merchant API-এর মাধ্যমে সরাসরি আপনার অ্যাডমিন প্যানেল থেকে
              ১-ক্লিকে পার্সেল বুকিং, লাইভ হাব ট্র্যাকিং এবং স্বয়ংক্রিয় ক্যাশ-অন-ডেলিভারি (COD) পরিচালনা করুন।
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={copyWebhook}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 shadow-sm ${
                copiedWebhook
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : isDark
                  ? 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {copiedWebhook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
              <span>{copiedWebhook ? 'Webhook Copied!' : 'Copy Webhook URL'}</span>
            </button>

            <Link
              href="/admin/delivery"
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 shadow-sm ${
                isDark
                  ? 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4 text-indigo-400" />
              <span>All Shipments</span>
            </Link>

            <Link
              href="/admin/orders"
              className="px-5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Orders Console</span>
            </Link>
          </div>
        </div>

        {/* 4 Brand & Status Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/60">
          {/* 1. Steadfast Live Status */}
          <div className={`p-4 rounded-2xl border transition-all relative overflow-hidden group hover:border-emerald-500/50 ${
            isDark ? 'bg-[#0f172a]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[10px] flex items-center justify-center">
                  SF
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Steadfast</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                sfConfigured
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sfConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {sfConfigured ? 'Ready' : 'Setup Required'}
              </span>
            </div>
            <div className="text-lg font-black text-emerald-400 truncate">
              {courier?.lastTested?.steadfast?.balance !== undefined
                ? `৳${courier.lastTested.steadfast.balance.toLocaleString('en-BD')} BDT`
                : sfConfigured ? 'Connected & Active' : 'API Key Missing'}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Nationwide 64 Districts Coverage
            </span>
          </div>

          {/* 2. Pathao Live Status */}
          <div className={`p-4 rounded-2xl border transition-all relative overflow-hidden group hover:border-rose-500/50 ${
            isDark ? 'bg-[#0f172a]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-black text-[10px] flex items-center justify-center">
                  PT
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Pathao Aladdin</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                pathaoConfigured
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pathaoConfigured ? 'bg-rose-400' : 'bg-amber-400'}`} />
                {pathaoConfigured ? 'Active' : 'Setup Required'}
              </span>
            </div>
            <div className="text-lg font-black text-rose-400 truncate">
              {courier?.pathao?.storeId
                ? `Store #${courier.pathao.storeId}`
                : pathaoConfigured ? 'OAuth Authenticated' : 'Client ID Missing'}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {courier?.pathao?.isSandbox ? 'Test Sandbox Mode' : 'Express On-Demand Ready'}
            </span>
          </div>

          {/* 3. Inside Dhaka Routing */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0f172a]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Inside Dhaka City</span>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                City Route
              </span>
            </div>
            <div className="text-lg font-black text-blue-400 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>{courier?.defaultCourierDhaka || 'Steadfast'}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Estimated 24h Next-Day Delivery
            </span>
          </div>

          {/* 4. Outside Dhaka Routing */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0f172a]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Outside Dhaka</span>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Nationwide
              </span>
            </div>
            <div className="text-lg font-black text-indigo-400 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{courier?.defaultCourierOutsideDhaka || 'Pathao'}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Estimated 48-72h Division Hubs
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TAB CONTROLS WITH GLOW ACCENT */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('api-keys')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 ${
            activeTab === 'api-keys'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>API Key Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 ${
            activeTab === 'orders'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>1-Click Order Dispatcher</span>
          {pendingDispatchOrders.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
              {pendingDispatchOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 ${
            activeTab === 'guide'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>API Key সংগ্রহ নির্দেশিকা</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. TAB 1: API KEYS MANAGER (PREMIUM) */}
      {/* ========================================================= */}
      {activeTab === 'api-keys' && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          <CourierSettingsManager />
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TAB 2: 1-CLICK ORDER DISPATCH TABLE */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          <div className={`border rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl ${
            isDark ? 'bg-[#0c1322] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/60 mb-6">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  <span>Real-time Order Dispatch Console</span>
                </h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  যেকোনো অর্ডারের পাশে &quot;API Send&quot; চাপলে সরাসরি Steadfast বা Pathao মার্চেন্ট পোর্টালে পার্সেল তৈরি হয়ে যাবে।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                  {pendingDispatchOrders.length} Pending Dispatch
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  {dispatchedOrders.length} In Transit / Dispatched
                </span>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <Package className="w-12 h-12 mx-auto text-slate-600" />
                <p className="font-bold text-sm">কোনো অর্ডার পাওয়া যায়নি</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b text-[10px] uppercase font-black tracking-wider ${
                      isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                    }`}>
                      <th className="py-3.5 px-4">Order #</th>
                      <th className="py-3.5 px-4">Customer Details</th>
                      <th className="py-3.5 px-4">Delivery Destination</th>
                      <th className="py-3.5 px-4">Pay Method & Amount</th>
                      <th className="py-3.5 px-4">Courier Status</th>
                      <th className="py-3.5 px-4 text-right">Quick Dispatch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {orders.slice(0, 15).map((ord) => {
                      const hasConsignment = Boolean(
                        ord.delivery?.trackingNumber || ord.delivery?.consignmentId
                      );

                      return (
                        <tr
                          key={ord.id}
                          className={`hover:bg-slate-800/30 transition-colors ${
                            isDark ? '' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-4 px-4 font-mono font-bold text-blue-400">
                            #{ord.orderNumber}
                            <span className="block text-[10px] text-slate-500 font-normal">
                              {new Date(ord.createdAt).toLocaleDateString('en-GB')}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-black text-sm">{ord.customer?.fullName || 'Customer'}</div>
                            <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <span>{ord.customer?.phone}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span>{ord.customer?.district || 'Dhaka'}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {ord.customer?.address || 'Banani'}
                            </p>
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-black text-sm text-emerald-400">
                              ৳{(ord.totalAmount || 0).toLocaleString('en-BD')}
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                              {ord.paymentMethod?.toUpperCase()} • {ord.paymentStatus}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            {hasConsignment ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{ord.delivery?.courierCompany || 'Courier'}</span>
                                </span>
                                <div className="font-mono text-[10px] text-slate-400">
                                  {ord.delivery?.trackingNumber || ord.delivery?.consignmentId}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Awaiting Send</span>
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedOrderForDispatch(ord)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                                  hasConsignment
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25'
                                }`}
                              >
                                <Zap className="w-3.5 h-3.5" />
                                <span>{hasConsignment ? 'Re-Send' : 'API Send'}</span>
                              </button>

                              {hasConsignment && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setTrackingModalData({
                                      open: true,
                                      courier: ord.delivery?.courierCompany || 'Steadfast',
                                      tracking:
                                        ord.delivery?.trackingNumber || ord.delivery?.consignmentId || '',
                                      cid: ord.delivery?.consignmentId,
                                      orderNumber: ord.orderNumber,
                                    })
                                  }
                                  className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                                    isDark
                                      ? 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
                                      : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                  title="View Live Courier Hub Status"
                                >
                                  <Truck className="w-4 h-4 text-emerald-400" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. TAB 3: STEP-BY-STEP BANGLA SETUP GUIDE */}
      {/* ========================================================= */}
      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in-50 duration-300">
          {/* Steadfast Guide Card */}
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 backdrop-blur-xl shadow-xl ${
            isDark ? 'bg-[#0c1322] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800/60">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-500/20">
                SF
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight">Steadfast Courier API Guide</h4>
                <span className="text-xs text-slate-400">Steadfast Merchant Dashboard Integration</span>
              </div>
            </div>

            <ol className="space-y-4 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              <li className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                আপনার ব্রাউজারে Steadfast মার্চেন্ট পোর্টালে যান:
                <a
                  href="https://portal.steadfast.com.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline font-bold inline-flex items-center gap-1 ml-1.5"
                >
                  portal.steadfast.com.bd <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                ড্যাশবোর্ডের বাম পাশের মেনু থেকে <strong>&quot;API Credentials&quot;</strong> অপশনে ক্লিক করুন।
              </li>
              <li className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                সেখানে প্রদর্শিত <strong>API Key</strong> এবং <strong>Secret Key</strong> কপি করুন।
              </li>
              <li className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                আমাদের ওয়েবসাইটের <strong>Steadfast Courier API</strong> কার্ডে এগুলো পেস্ট করে <strong>&quot;Test Connection & Balance&quot;</strong> বাটনে চাপ দিন।
              </li>
              <li className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                কানেকশন সফল হয়ে ব্যালেন্স দেখালে উপরে <strong>&quot;Save Courier API Credentials&quot;</strong> চেপে সেভ করে নিন!
              </li>
            </ol>
          </div>

          {/* Pathao Guide Card */}
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 backdrop-blur-xl shadow-xl ${
            isDark ? 'bg-[#0c1322] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800/60">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black text-lg shadow-lg shadow-rose-500/20">
                PT
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight">Pathao Merchant API Guide</h4>
                <span className="text-xs text-slate-400">Pathao Developer Aladdin API OAuth 2.0</span>
              </div>
            </div>

            <ol className="space-y-4 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              <li className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                আপনার Pathao মার্চেন্ট অ্যাকাউন্টে লগইন করুন:
                <a
                  href="https://merchant.pathao.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-400 hover:underline font-bold inline-flex items-center gap-1 ml-1.5"
                >
                  merchant.pathao.com <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <strong>Settings &gt; Developer API</strong>-তে গিয়ে নতুন API Client তৈরি করে <strong>Client ID</strong> ও <strong>Client Secret</strong> নিন।
              </li>
              <li className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                আপনার মার্চেন্ট <strong>Email/Username</strong> এবং <strong>Password</strong> ইনপুট দিন।
              </li>
              <li className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <strong>&quot;Test Auth & Load Stores&quot;</strong> চাপলে আপনার রেজিস্টার্ড স্টোর লিস্ট স্বয়ংক্রিয়ভাবে লোড হবে।
              </li>
              <li className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                পছন্দের পিকআপ হাব সিলেক্ট করে <strong>&quot;Save Courier API Credentials&quot;</strong> চাপুন।
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODALS FOR LIVE ACTIONS */}
      {/* ========================================================= */}
      {selectedOrderForDispatch && (
        <CourierDispatchModal
          order={selectedOrderForDispatch}
          isOpen={true}
          onClose={() => setSelectedOrderForDispatch(null)}
          onSuccess={() => {
            setSelectedOrderForDispatch(null);
          }}
        />
      )}

      <CourierTrackingModal
        isOpen={trackingModalData.open}
        onClose={() => setTrackingModalData({ ...trackingModalData, open: false })}
        courierCompany={trackingModalData.courier}
        trackingNumber={trackingModalData.tracking}
        consignmentId={trackingModalData.cid}
        orderNumber={trackingModalData.orderNumber}
      />
    </div>
  );
}
