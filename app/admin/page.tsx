'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  Calendar,
  Store,
} from 'lucide-react';
import { useOrder } from '@/lib/store/orderContext';
import { useProducts } from '@/lib/store/productsContext';
import { useAdminTheme } from '@/lib/store/adminThemeContext';
import AdminThemeToggle from '@/components/admin/AdminThemeToggle';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { orders } = useOrder();
  const { products } = useProducts();
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  // Filters & State
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '14d' | '30d'>('7d');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Metrics Calculations
  const completedOrders = orders.filter(
    (o) => o.paymentStatus === 'completed' || o.orderStatus === 'Delivered'
  );
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0) || 58400;
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed'
  ).length;
  const lowStockProducts = products.filter((p) => (p.totalStock ?? 50) < 40);

  // Sales Trends simulated bars for timeframes
  const weeklySalesData = {
    '7d': [
      { day: 'Sat', amount: 16200 },
      { day: 'Sun', amount: 19500 },
      { day: 'Mon', amount: 24400 },
      { day: 'Tue', amount: 21800 },
      { day: 'Wed', amount: 28500 },
      { day: 'Thu', amount: 33200 },
      { day: 'Fri', amount: 41900, isToday: true },
    ],
    '14d': [
      { day: 'W1 Sat', amount: 14000 },
      { day: 'W1 Mon', amount: 19000 },
      { day: 'W1 Wed', amount: 24000 },
      { day: 'W1 Fri', amount: 32000 },
      { day: 'W2 Sun', amount: 22000 },
      { day: 'W2 Tue', amount: 27000 },
      { day: 'W2 Fri', amount: 41900, isToday: true },
    ],
    '30d': [
      { day: 'Week 1', amount: 112000 },
      { day: 'Week 2', amount: 135000 },
      { day: 'Week 3', amount: 148000 },
      { day: 'Week 4', amount: 182000, isToday: true },
    ],
  };

  const currentSales = weeklySalesData[selectedTimeframe];
  const maxSale = Math.max(...currentSales.map((s) => s.amount));

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.phone.includes(orderSearch) ||
      o.customer.district.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus =
      orderStatusFilter === 'all' ||
      o.orderStatus.toLowerCase() === orderStatusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto transition-colors duration-200">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className={`text-2xl lg:text-3xl font-black tracking-tight uppercase ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Store Performance Overview
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Sparkles className="w-3 h-3" />
              <span>HQ Analytics</span>
            </span>
          </div>
          <p
            className={`text-xs mt-1 flex items-center gap-2 flex-wrap ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>Real-time analytics, inventory stocks, and customer orders for Jeans BD</span>
            <span className="hidden md:inline-block w-1 h-1 rounded-full bg-slate-400" />
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Sync Active
            </span>
          </p>
        </div>

        {/* Action Controls & Theme Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Theme Switcher Button */}
          <AdminThemeToggle variant="compact" />

          {/* Quick Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
              isDark
                ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-blue-500" />
            <span>Storefront</span>
          </Link>

          {/* Add Product Button */}
          <Link
            href="/admin/products?action=add"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI METRIC STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Revenue */}
        <div
          className={`p-5 rounded-3xl border transition-all duration-200 hover:-translate-y-1 ${
            isDark
              ? 'bg-[#0d1322]/90 hover:bg-[#0f172a] border-slate-800/90 shadow-lg shadow-black/20 hover:border-blue-500/40'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div
            className={`text-2xl lg:text-3xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {formatPrice(totalRevenue)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/40">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% this week</span>
            </div>
            <span
              className={`text-[10px] font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Avg: ৳1,950/ord
            </span>
          </div>
        </div>

        {/* Card 2: Orders */}
        <div
          className={`p-5 rounded-3xl border transition-all duration-200 hover:-translate-y-1 ${
            isDark
              ? 'bg-[#0d1322]/90 hover:bg-[#0f172a] border-slate-800/90 shadow-lg shadow-black/20 hover:border-blue-500/40'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Total Orders
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div
            className={`text-2xl lg:text-3xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {totalOrdersCount}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/40">
            <span className="text-[11px] text-blue-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {pendingOrdersCount} orders need action
            </span>
            <Link
              href="/admin/orders"
              className="text-[10px] text-blue-500 hover:underline font-bold"
            >
              View &rarr;
            </Link>
          </div>
        </div>

        {/* Card 3: Active Products */}
        <div
          className={`p-5 rounded-3xl border transition-all duration-200 hover:-translate-y-1 ${
            isDark
              ? 'bg-[#0d1322]/90 hover:bg-[#0f172a] border-slate-800/90 shadow-lg shadow-black/20 hover:border-purple-500/40'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Active Products
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div
            className={`text-2xl lg:text-3xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {products.length}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/40">
            <span
              className={`text-[11px] font-semibold ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              In 8 Denim Categories
            </span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
        </div>

        {/* Card 4: Low Stock Alerts */}
        <div
          className={`p-5 rounded-3xl border transition-all duration-200 hover:-translate-y-1 ${
            isDark
              ? 'bg-[#0d1322]/90 hover:bg-[#0f172a] border-slate-800/90 shadow-lg shadow-black/20 hover:border-amber-500/40'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Low Stock Alerts
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black tracking-tight text-amber-500">
            {lowStockProducts.length} Items
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/40">
            <span className="text-[11px] text-amber-500/90 font-semibold">
              Restock suggested
            </span>
            <Link
              href="/admin/products"
              className="text-[10px] text-amber-500 hover:underline font-bold"
            >
              Check &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 3. CHART & STOCK ALERTS SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Interactive Chart */}
        <div
          className={`lg:col-span-2 p-6 rounded-3xl border space-y-6 transition-colors ${
            isDark
              ? 'bg-[#0d1322]/90 border-slate-800/90 shadow-md shadow-black/20'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3
                className={`text-base font-black uppercase tracking-wider ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Weekly Revenue (BDT)
              </h3>
              <p
                className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Daily sales performance across Bangladesh
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Timeframe Selector Pills */}
              <div
                className={`p-1 rounded-xl flex items-center gap-1 border ${
                  isDark
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                {(['7d', '14d', '30d'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                      selectedTimeframe === tf
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <span className="hidden sm:inline-block text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Avg: ৳24,500 / day
              </span>
            </div>
          </div>

          {/* Bar Chart Canvas Container */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-1">
            {currentSales.map((item) => {
              const heightPct = Math.round((item.amount / maxSale) * 100);
              return (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-2 group relative cursor-pointer"
                >
                  {/* Hover Floating Value Tooltip */}
                  <div
                    className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-black pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-lg ${
                      isDark
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'bg-slate-900 text-white shadow-slate-400/50'
                    }`}
                  >
                    {formatPrice(item.amount)}
                  </div>

                  {/* Pillar Track & Active Bar */}
                  <div
                    className={`w-full rounded-2xl h-40 flex items-end p-1 transition-all ${
                      isDark ? 'bg-slate-900/90' : 'bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-full rounded-xl transition-all duration-500 group-hover:scale-[1.02] ${
                        item.isToday
                          ? 'bg-gradient-to-t from-blue-700 via-blue-600 to-cyan-400 shadow-md shadow-blue-500/40'
                          : isDark
                          ? 'bg-gradient-to-t from-blue-800/80 to-blue-600 group-hover:to-blue-500'
                          : 'bg-gradient-to-t from-blue-600 to-blue-500 group-hover:to-blue-400'
                      }`}
                      style={{ height: `${Math.max(heightPct, 12)}%` }}
                    />
                  </div>

                  {/* Day Label with Today badge */}
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-xs font-bold transition-colors ${
                        item.isToday
                          ? 'text-blue-500 font-black'
                          : isDark
                          ? 'text-slate-400 group-hover:text-slate-200'
                          : 'text-slate-500 group-hover:text-slate-900'
                      }`}
                    >
                      {item.day}
                    </span>
                    {item.isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-0.5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stock Alerts Widget */}
        <div
          className={`p-6 rounded-3xl border space-y-4 transition-colors ${
            isDark
              ? 'bg-[#0d1322]/90 border-slate-800/90 shadow-md shadow-black/20'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}
          >
            <div>
              <h3
                className={`text-base font-black uppercase tracking-wider ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Stock Alerts
              </h3>
              <p
                className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Items nearing depletion
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs text-blue-500 hover:underline font-bold"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockProducts.slice(0, 4).map((p) => {
              const stock = p.totalStock ?? 15;
              const isCritical = stock <= 15;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all hover:scale-[1.01] ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="w-11 h-13 rounded-xl object-cover border border-slate-700/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4
                        className={`font-bold text-xs line-clamp-1 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] uppercase font-semibold ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {p.fit}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span
                          className={`text-[10px] font-bold ${
                            isCritical ? 'text-rose-500' : 'text-amber-500'
                          }`}
                        >
                          {isCritical ? 'Critical' : 'Low Stock'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-xl shrink-0 border ${
                      isCritical
                        ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                        : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                    }`}
                  >
                    {stock} left
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. RECENT CUSTOMER ORDERS SECTION */}
      <div
        className={`p-6 rounded-3xl border space-y-4 transition-colors ${
          isDark
            ? 'bg-[#0d1322]/90 border-slate-800/90 shadow-md shadow-black/20'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div
          className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <div>
            <h3
              className={`text-base font-black uppercase tracking-wider ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Recent Customer Orders
            </h3>
            <p
              className={`text-xs ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Track and update live customer deliveries in Bangladesh
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by order, customer, phone..."
                className="bg-transparent focus:outline-none w-44 sm:w-56 text-xs placeholder:text-slate-400"
              />
            </div>

            {/* Quick Status Filters */}
            <div
              className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${
                isDark
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              {(['all', 'Pending', 'Shipped', 'Delivered'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    orderStatusFilter.toLowerCase() === st.toLowerCase()
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <Link
              href="/admin/orders"
              className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Order Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`text-[11px] font-black uppercase tracking-wider border-b pb-2 ${
                isDark
                  ? 'text-slate-400 border-slate-800'
                  : 'text-slate-500 border-slate-100'
              }`}
            >
              <tr>
                <th className="py-3 px-3">Order No</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y font-medium ${
                isDark
                  ? 'divide-slate-800/60 text-slate-300'
                  : 'divide-slate-100 text-slate-700'
              }`}
            >
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.slice(0, 8).map((ord) => {
                  const initials = ord.customer.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={ord.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-black font-mono ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {ord.orderNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-black text-[10px] flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span
                              className={`font-bold block ${
                                isDark ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {ord.customer.fullName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {ord.customer.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            isDark
                              ? 'bg-slate-900 text-slate-300 border border-slate-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ord.customer.district}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`font-black ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {formatPrice(ord.totalAmount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded border ${
                            ord.paymentMethod === 'bkash'
                              ? 'bg-pink-500/10 text-pink-500 border-pink-500/20'
                              : ord.paymentMethod === 'nagad'
                              ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                              : isDark
                              ? 'bg-slate-900 text-slate-300 border-slate-700'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {ord.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : ord.orderStatus === 'Shipped'
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              ord.orderStatus === 'Delivered'
                                ? 'bg-emerald-500'
                                : ord.orderStatus === 'Shipped'
                                ? 'bg-blue-500 animate-pulse'
                                : 'bg-amber-500'
                            }`}
                          />
                          <span>{ord.orderStatus}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <Link
                          href={`/admin/orders?order=${ord.orderNumber}`}
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all active:scale-95 ${
                            isDark
                              ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'
                          }`}
                        >
                          <span>Manage</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
