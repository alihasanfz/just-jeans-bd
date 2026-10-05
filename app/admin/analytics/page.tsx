'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  CreditCard,
  PieChart,
  BarChart2,
  Users,
  Sparkles,
} from 'lucide-react';
import { useOrder } from '@/lib/store/orderContext';
import { useProducts } from '@/lib/store/productsContext';
import { useAdminTheme } from '@/lib/store/adminThemeContext';
import { formatPrice } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const { orders } = useOrder();
  const { products } = useProducts();
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'year'>('30days');

  // KPI Calculations
  const totalRevenue =
    orders.reduce(
      (sum, o) =>
        sum +
        (o.paymentStatus === 'completed' || o.orderStatus === 'Delivered'
          ? o.totalAmount
          : o.totalAmount * 0.85),
      0
    ) + 142500;
  const totalOrders = orders.length + 84;
  const averageOrderValue = Math.round(totalRevenue / totalOrders);
  const conversionRate = 3.8; // percentage

  // Daily revenue data for simulated interactive bar chart
  const salesHistory = [
    { day: 'Sat', sales: 16800, orders: 8 },
    { day: 'Sun', sales: 21400, orders: 11 },
    { day: 'Mon', sales: 28500, orders: 14 },
    { day: 'Tue', sales: 24200, orders: 12 },
    { day: 'Wed', sales: 34600, orders: 17 },
    { day: 'Thu', sales: 42100, orders: 21 },
    { day: 'Fri', sales: 51800, orders: 26 },
  ];
  const maxSale = Math.max(...salesHistory.map((s) => s.sales));

  // Category shares
  const fitDistribution = [
    { fit: 'Baggy & Skater Fits', percentage: 38, revenue: 84200, color: '#3b82f6' },
    { fit: 'Slim Flex Denim', percentage: 27, revenue: 59800, color: '#10b981' },
    { fit: 'High-Rise Wide Leg', percentage: 18, revenue: 39800, color: '#8b5cf6' },
    { fit: 'Tactical Cargo Jeans', percentage: 11, revenue: 24300, color: '#f59e0b' },
    { fit: 'Denim Jackets & Vests', percentage: 6, revenue: 13200, color: '#ec4899' },
  ];

  // Delivery Region breakdown
  const regionalSales = [
    { region: 'Inside Dhaka (Home Courier)', percentage: 64, orders: 58, revenue: 142000 },
    { region: 'Outside Dhaka (Chittagong, Sylhet, etc.)', percentage: 36, orders: 32, revenue: 79800 },
  ];

  // Payment Breakdown
  const paymentBreakdown = [
    { method: 'Cash on Delivery (COD)', share: 58, color: '#10b981' },
    { method: 'bKash Merchant Pay', share: 32, color: '#e2136e' },
    { method: 'Nagad Online Pay', share: 10, color: '#f7941d' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Store Performance & Sales KPIs</span>
          </div>
          <h1 className={`text-2xl lg:text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Sales & Business Analytics
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Real-time financial trends, denim fit performance, and delivery metrics for Jeans BD
          </p>
        </div>

        {/* Timeframe selector */}
        <div className={`flex items-center gap-1.5 p-1 rounded-2xl border ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: '7 Days' },
            { id: '30days', label: '30 Days' },
            { id: 'year', label: '1 Year' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === t.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-3xl border space-y-3 transition-colors ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formatPrice(totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs last period</span>
          </div>
        </div>

        <div className={`p-5 rounded-3xl border space-y-3 transition-colors ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {totalOrders} Orders
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.6% order volume</span>
          </div>
        </div>

        <div className={`p-5 rounded-3xl border space-y-3 transition-colors ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Average Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formatPrice(averageOrderValue)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-500 font-bold">
            <span>2.1 items per basket</span>
          </div>
        </div>

        <div className={`p-5 rounded-3xl border space-y-3 transition-colors ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Store Conversion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {conversionRate}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>High intent traffic</span>
          </div>
        </div>
      </div>

      {/* Main Chart Section: Weekly Revenue Flow */}
      <div className={`p-6 rounded-3xl border space-y-5 transition-colors ${
        isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className={`text-base font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Revenue & Order Trends (Weekly)
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Daily revenue fluctuation and parcel volume dispatched via Steadfast/Pathao
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
              <span>Revenue (BDT)</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className={`h-60 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          {salesHistory.map((item) => {
            const heightPct = Math.round((item.sales / maxSale) * 100);
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className={`opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow ${
                  isDark ? 'bg-slate-900 border border-slate-800 text-emerald-400' : 'bg-slate-900 text-white'
                }`}>
                  ৳{item.sales.toLocaleString()}
                </div>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full max-w-[48px] bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-xl transition-all group-hover:from-blue-600 group-hover:to-cyan-400 shadow-lg shadow-blue-600/20"
                />
                <span className={`text-xs font-bold ${isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'}`}>
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Breakdown: Fit Shares & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Fit Share */}
        <div className={`p-6 rounded-3xl border space-y-4 transition-colors ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <BarChart2 className="w-4 h-4 text-blue-500" />
            <span>Sales by Denim Fit Silhouette</span>
          </h3>

          <div className="space-y-3.5 pt-2">
            {fitDistribution.map((item) => (
              <div key={item.fit} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{item.fit}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(item.revenue)}</span>
                    <span className="text-slate-400 text-[11px]">({item.percentage}%)</span>
                  </div>
                </div>
                <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                  <div
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    className="h-full rounded-full transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods & Regions */}
        <div className={`p-6 rounded-3xl border space-y-5 transition-colors ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span>Payment Methods Distribution</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 pt-3">
              {paymentBreakdown.map((p) => (
                <div
                  key={p.method}
                  className={`p-3 rounded-2xl border text-center ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 block truncate">{p.method}</span>
                  <div
                    className="text-lg font-black mt-1"
                    style={{ color: p.color }}
                  >
                    {p.share}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`pt-3 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Truck className="w-4 h-4 text-blue-500" />
              <span>Dhaka vs Nationwide Delivery Split</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {regionalSales.map((r) => (
                <div
                  key={r.region}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>{r.region}</span>
                    <span className="text-[11px] text-slate-400">{r.orders} parcels delivered</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-500 text-sm block">
                      {formatPrice(r.revenue)}
                    </span>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                      {r.percentage}% of volume
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
