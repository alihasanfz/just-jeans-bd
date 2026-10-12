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
    <Suspense fallback={<div className="p-8 text-slate-400">Loading Courier API Console...</div>}>
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

  const [activeView, setActiveView] = useState<'api-settings' | 'quick-dispatch' | 'guide'>('api-settings');
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<Order | null>(null);
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

  // Recent dispatched orders
  const dispatchedOrders = orders.filter(
    (o) => o.delivery?.trackingNumber || o.delivery?.consignmentId || o.delivery?.courierCompany
  ).slice(0, 5);

  return (
    <div className={`p-4 md:p-8 space-y-8 min-h-screen ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Hero Header */}
      <div className={`border rounded-3xl p-6 lg:p-8 relative overflow-hidden backdrop-blur-xl ${
        isDark ? 'bg-[#0d1322]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/10 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Logistics Gateway
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Steadfast & Pathao APIs
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
              <Truck className="w-8 h-8 text-blue-500" />
              <span>Courier APIs & Dispatch Hub</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Steadfast Courier API এবং Pathao Merchant API এর মাধ্যমে সরাসরি ওয়েবসাইট থেকে ১-ক্লিকে পার্সেল বুকিং, ট্র্যাকিং এবং ব্যালেন্স নিয়ন্ত্রণ করুন।
            </p>
          </div>

          {/* Quick Actions & Links */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/delivery"
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
                isDark ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Package className="w-4 h-4 text-blue-500" />
              <span>Shipments Table</span>
            </Link>
            <Link
              href="/admin/orders"
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
                isDark ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Orders Console</span>
            </Link>
          </div>
        </div>

        {/* Live Provider Health Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/60">
          {/* Steadfast Status Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase text-slate-400">Steadfast Courier</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                sfConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {sfConfigured ? 'Connected' : 'Setup Required'}
              </span>
            </div>
            <div className="text-base font-black truncate">
              {courier?.lastTested?.steadfast?.balance !== undefined
                ? `৳${courier.lastTested.steadfast.balance.toLocaleString('en-BD')} BDT`
                : sfConfigured ? 'API Key Active' : 'API Key Missing'}
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              {sfConfigured ? 'Nationwide Delivery Ready' : 'Add API Key below'}
            </span>
          </div>

          {/* Pathao Status Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase text-slate-400">Pathao Merchant</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                pathaoConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {pathaoConfigured ? 'OAuth Active' : 'Setup Required'}
              </span>
            </div>
            <div className="text-base font-black truncate">
              {courier?.pathao?.storeId ? `Store ID: ${courier.pathao.storeId}` : pathaoConfigured ? 'Aladdin API Ready' : 'Credentials Missing'}
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              {pathaoConfigured ? 'Express On-demand Ready' : 'Add Client ID/Secret below'}
            </span>
          </div>

          {/* Dhaka Default */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase text-slate-400">Inside Dhaka Route</span>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                City Express
              </span>
            </div>
            <div className="text-base font-black text-blue-400">
              {courier?.defaultCourierDhaka || 'Steadfast'}
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              Auto-assigned for Dhaka orders
            </span>
          </div>

          {/* Outside Dhaka Default */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase text-slate-400">Outside Dhaka Route</span>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Nationwide
              </span>
            </div>
            <div className="text-base font-black text-indigo-400">
              {courier?.defaultCourierOutsideDhaka || 'Pathao'}
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              Auto-assigned for Outside Dhaka
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveView('api-settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeView === 'api-settings'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>API Key Configuration</span>
        </button>

        <button
          onClick={() => setActiveView('quick-dispatch')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeView === 'quick-dispatch'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Quick 1-Click Order Dispatch</span>
          {orders.filter((o) => !o.delivery?.trackingNumber).length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {orders.filter((o) => !o.delivery?.trackingNumber).length} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('guide')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeView === 'guide'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>API Key সংগ্রহ করার নির্দেশিকা</span>
        </button>
      </div>

      {/* Main Content Areas */}
      {activeView === 'api-settings' && (
        <div className="space-y-6">
          <CourierSettingsManager />
        </div>
      )}

      {activeView === 'quick-dispatch' && (
        <div className="space-y-6">
          <div className={`border rounded-3xl p-6 shadow-sm ${
            isDark ? 'bg-[#0d1322] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-6">
              <div>
                <h3 className="font-black text-lg">Orders Ready for Courier Dispatch</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  নিচের যে কোনো অর্ডারের পাশে &quot;API Send&quot; চাপলেই সরাসরি Steadfast বা Pathao পোর্টালে কনসাইনমেন্ট তৈরি হবে।
                </p>
              </div>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
                {orders.length} Total Orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                কোনো অর্ডার পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b text-[10px] uppercase font-black tracking-wider ${
                      isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                    }`}>
                      <th className="py-3 px-3">Order #</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">District & Address</th>
                      <th className="py-3 px-3">Total Amount</th>
                      <th className="py-3 px-3">Courier Status</th>
                      <th className="py-3 px-3 text-right">Instant Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {orders.slice(0, 10).map((ord) => {
                      const hasConsignment = Boolean(ord.delivery?.trackingNumber || ord.delivery?.consignmentId);
                      return (
                        <tr key={ord.id} className={`hover:bg-slate-800/30 transition-colors ${
                          isDark ? '' : 'hover:bg-slate-50'
                        }`}>
                          <td className="py-3.5 px-3 font-mono font-bold text-blue-400">
                            #{ord.orderNumber}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-bold">{ord.customer?.fullName || 'Customer'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{ord.customer?.phone}</div>
                          </td>
                          <td className="py-3.5 px-3 max-w-xs truncate">
                            <span className="font-bold text-slate-300 mr-1.5">{ord.customer?.district || 'Dhaka'}:</span>
                            <span className="text-slate-400">{ord.customer?.address || 'Banani'}</span>
                          </td>
                          <td className="py-3.5 px-3 font-bold">
                            ৳{(ord.totalAmount || 0).toLocaleString('en-BD')}
                          </td>
                          <td className="py-3.5 px-3">
                            {hasConsignment ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                {ord.delivery?.courierCompany || 'Dispatched'}: {ord.delivery?.trackingNumber || ord.delivery?.consignmentId}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Clock className="w-3 h-3" />
                                Pending Dispatch
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedOrderForDispatch(ord)}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                <span>{hasConsignment ? 'Re-Dispatch' : 'API Send'}</span>
                              </button>

                              {hasConsignment && (
                                <button
                                  type="button"
                                  onClick={() => setTrackingModalData({
                                    open: true,
                                    courier: ord.delivery?.courierCompany || 'Steadfast',
                                    tracking: ord.delivery?.trackingNumber || ord.delivery?.consignmentId || '',
                                    cid: ord.delivery?.consignmentId,
                                    orderNumber: ord.orderNumber,
                                  })}
                                  className={`px-2.5 py-1.5 rounded-xl border font-bold text-xs transition-colors flex items-center gap-1 ${
                                    isDark ? 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                                  <span>Live Hub</span>
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

      {activeView === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Steadfast Guide */}
          <div className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-[#0d1322] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black">
                SF
              </div>
              <div>
                <h4 className="font-black text-base">Steadfast Courier API Key সংগ্রহ করার নিয়ম</h4>
                <span className="text-[11px] text-slate-400">Steadfast Merchant Dashboard</span>
              </div>
            </div>

            <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              <li>
                আপনার Steadfast মার্চেন্ট পোর্টালে লগইন করুন:  
                <a
                  href="https://portal.steadfast.com.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline inline-flex items-center gap-1 ml-1"
                >
                  portal.steadfast.com.bd <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>বাম পাশের মেনু থেকে <strong>&quot;API Credentials&quot;</strong> বা <strong>&quot;Developer API&quot;</strong> অপশনে যান।</li>
              <li>সেখানে আপনার <strong>API Key</strong> এবং <strong>Secret Key</strong> দেখতে পাবেন।</li>
              <li>সেগুলো কপি করে এই পেজের <strong>Steadfast Courier</strong> কার্ডে পেস্ট করে <strong>&quot;Test Connection & Balance&quot;</strong> বাটনে চাপ দিন।</li>
              <li>ব্যালেন্স সফলভাবে দেখালে <strong>&quot;Save Courier API Credentials&quot;</strong> চেপে সেভ করে নিন!</li>
            </ol>
          </div>

          {/* Pathao Guide */}
          <div className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-[#0d1322] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-black">
                PT
              </div>
              <div>
                <h4 className="font-black text-base">Pathao Merchant API Credentials সংগ্রহ করার নিয়ম</h4>
                <span className="text-[11px] text-slate-400">Pathao Developer Portal (Aladdin)</span>
              </div>
            </div>

            <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              <li>
                আপনার Pathao মার্চেন্ট অ্যাকাউন্টে লগইন করুন:  
                <a
                  href="https://merchant.pathao.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline inline-flex items-center gap-1 ml-1"
                >
                  merchant.pathao.com <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li><strong>Settings &gt; Developer API</strong>-তে গিয়ে একটি নতুন API Client তৈরি করুন।</li>
              <li>সেখান থেকে <strong>Client ID</strong> এবং <strong>Client Secret</strong> কপি করুন।</li>
              <li>আপনার Pathao একাউন্টের <strong>Username (Email)</strong> এবং <strong>Password</strong> প্রদান করুন।</li>
              <li><strong>&quot;Test Auth & Load Stores&quot;</strong> চাপলে আপনার রেজিস্টার্ড স্টোর লিস্ট স্বয়ংক্রিয়ভাবে লোড হবে।</li>
              <li>স্টোর সিলেক্ট করে <strong>&quot;Save Courier API Credentials&quot;</strong> চেপে সেভ করে নিন!</li>
            </ol>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {selectedOrderForDispatch && (
        <CourierDispatchModal
          order={selectedOrderForDispatch}
          isOpen={true}
          onClose={() => setSelectedOrderForDispatch(null)}
          onSuccess={(result) => {
            setSelectedOrderForDispatch(null);
          }}
        />
      )}

      {/* Tracking Modal */}
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
